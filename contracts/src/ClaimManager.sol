// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ProtectionVault} from "./ProtectionVault.sol";
import {RecoveryClaimNFT} from "./RecoveryClaimNFT.sol";
import {SupplyRightNFT} from "./SupplyRightNFT.sol";

/**
 * @title ClaimManager
 * @notice Orchestrates the claim submission, verification, and atomic settlement process.
 * @dev Enforces:
 *   - Independent verifier decision required before settlement
 *   - Settlement value <= min(contractual cap, verified amount, available collateral)
 *   - Atomic payout + Recovery Claim NFT (revert on partial failure)
 *   - No double payouts
 *   - Distinct authority separation (provider, verifier, buyer, agent)
 */
contract ClaimManager {
    ProtectionVault public immutable vault;
    RecoveryClaimNFT public immutable recoveryNFT;
    SupplyRightNFT public immutable commitmentNFT;

    address public verifier;
    address public agentWallet; // The AI agent's authorized wallet

    enum ClaimStatus {
        None,
        Submitted,
        VerifierApproved,
        VerifierRejected,
        Settled
    }

    struct Claim {
        uint256 commitmentTokenId;
        address buyer;
        uint256 deliveredQuantity;
        uint256 eligibleLoss; // Set by verifier, not auto-derived
        uint256 requestedPayout;
        bytes32 evidenceHash;
        ClaimStatus status;
        uint256 submittedAt;
        uint256 settledAt;
        uint256 recoveryTokenId;
        bytes32 settlementTxHash; // For audit trail
    }

    mapping(uint256 => Claim) public claims; // commitmentTokenId => Claim
    mapping(bytes32 => bool) public processedNonces; // Idempotency

    event ClaimSubmitted(
        uint256 indexed commitmentTokenId,
        address indexed buyer,
        uint256 deliveredQuantity,
        bytes32 evidenceHash
    );
    event ClaimVerified(
        uint256 indexed commitmentTokenId,
        address indexed verifier,
        uint256 eligibleLoss,
        bool approved
    );
    event SettlementExecuted(
        uint256 indexed commitmentTokenId,
        address indexed buyer,
        uint256 payoutAmount,
        uint256 recoveryTokenId,
        bytes32 evidenceHash
    );
    event ClaimRejected(uint256 indexed commitmentTokenId, string reason);

    modifier onlyVerifier() {
        require(msg.sender == verifier, "ClaimManager: caller is not the verifier");
        _;
    }

    modifier onlyAgentOrBuyer(uint256 commitmentTokenId) {
        Claim memory claim = claims[commitmentTokenId];
        require(
            msg.sender == agentWallet || msg.sender == claim.buyer,
            "ClaimManager: caller is not authorized"
        );
        _;
    }

    constructor(
        address _vault,
        address _recoveryNFT,
        address _commitmentNFT,
        address _verifier,
        address _agentWallet
    ) {
        vault = ProtectionVault(_vault);
        recoveryNFT = RecoveryClaimNFT(_recoveryNFT);
        commitmentNFT = SupplyRightNFT(_commitmentNFT);
        verifier = _verifier;
        agentWallet = _agentWallet;
    }

    /**
     * @notice Submit a claim for a registered commitment.
     * @param commitmentTokenId The SupplyRightNFT token ID
     * @param deliveredQuantity How many units were actually delivered
     * @param evidenceHash Hash of the evidence documentation
     * @param nonce Unique nonce for idempotency
     */
    function submitClaim(
        uint256 commitmentTokenId,
        uint256 deliveredQuantity,
        bytes32 evidenceHash,
        bytes32 nonce
    ) external {
        // Idempotency check
        require(!processedNonces[nonce], "ClaimManager: nonce already processed");
        processedNonces[nonce] = true;

        // Verify commitment exists and is active
        SupplyRightNFT.Commitment memory commitment = commitmentNFT.getCommitment(commitmentTokenId);
        require(commitment.active, "ClaimManager: commitment not active");

        // Verify policy is funded
        require(vault.isPolicyActive(commitmentTokenId), "ClaimManager: no active protection policy");

        // Verify no existing claim
        require(claims[commitmentTokenId].status == ClaimStatus.None, "ClaimManager: claim already exists");

        // Verify caller is buyer or agent
        require(
            msg.sender == commitment.buyer || msg.sender == agentWallet,
            "ClaimManager: only buyer or agent can submit"
        );

        claims[commitmentTokenId] = Claim({
            commitmentTokenId: commitmentTokenId,
            buyer: commitment.buyer,
            deliveredQuantity: deliveredQuantity,
            eligibleLoss: 0, // Set by verifier
            requestedPayout: 0, // Calculated after verification
            evidenceHash: evidenceHash,
            status: ClaimStatus.Submitted,
            submittedAt: block.timestamp,
            settledAt: 0,
            recoveryTokenId: 0,
            settlementTxHash: bytes32(0)
        });

        emit ClaimSubmitted(commitmentTokenId, commitment.buyer, deliveredQuantity, evidenceHash);
    }

    /**
     * @notice Verifier approves or rejects a claim with the eligible loss amount.
     * @dev The verifier determines the eligible loss — it is NOT auto-derived from shortfall.
     * @param commitmentTokenId The commitment being verified
     * @param eligibleLoss The verified eligible loss in mETH (set by verifier, not calculated)
     * @param approved Whether the claim is approved
     */
    function verifyClaim(
        uint256 commitmentTokenId,
        uint256 eligibleLoss,
        bool approved
    ) external onlyVerifier {
        Claim storage claim = claims[commitmentTokenId];
        require(claim.status == ClaimStatus.Submitted, "ClaimManager: claim not in submitted state");

        if (approved) {
            require(eligibleLoss > 0, "ClaimManager: eligible loss must be > 0 for approval");
            claim.eligibleLoss = eligibleLoss;
            claim.status = ClaimStatus.VerifierApproved;

            // Calculate payout based on coverage rate
            ProtectionVault.Policy memory policy = vault.getPolicy(commitmentTokenId);
            uint256 coveredAmount = (eligibleLoss * policy.coverageRateBps) / 10000;
            // Payout = min(coveredAmount, available collateral)
            claim.requestedPayout = coveredAmount <= policy.collateralAmount
                ? coveredAmount
                : policy.collateralAmount;

            emit ClaimVerified(commitmentTokenId, msg.sender, eligibleLoss, true);
        } else {
            claim.status = ClaimStatus.VerifierRejected;
            emit ClaimVerified(commitmentTokenId, msg.sender, 0, false);
            emit ClaimRejected(commitmentTokenId, "Verifier rejected the claim");
        }
    }

    /**
     * @notice Execute atomic settlement: payout to buyer + Recovery Claim NFT mint.
     * @dev ATOMIC: If either operation fails, the entire transaction reverts.
     *      Only the agent wallet or the buyer can trigger settlement after verification.
     * @param commitmentTokenId The verified commitment to settle
     */
    function settleWithPayout(
        uint256 commitmentTokenId
    ) external onlyAgentOrBuyer(commitmentTokenId) {
        Claim storage claim = claims[commitmentTokenId];

        // Pre-conditions
        require(claim.status == ClaimStatus.VerifierApproved, "ClaimManager: claim not verified/approved");
        require(claim.requestedPayout > 0, "ClaimManager: no payout calculated");

        // Check collateral sufficiency
        uint256 availableCollateral = vault.getCollateral(commitmentTokenId);
        require(
            availableCollateral >= claim.requestedPayout,
            "ClaimManager: insufficient collateral"
        );

        // Mark as settled BEFORE external calls (reentrancy protection)
        claim.status = ClaimStatus.Settled;
        claim.settledAt = block.timestamp;

        // ATOMIC OPERATION 1: Release payout from vault to buyer
        vault.releasePayout(commitmentTokenId, claim.buyer, claim.requestedPayout);

        // ATOMIC OPERATION 2: Mint Recovery Claim NFT
        uint256 recoveryTokenId = recoveryNFT.mintRecoveryClaim(
            claim.buyer, // Recovery claim goes to buyer (can be transferred)
            commitmentTokenId,
            claim.requestedPayout,
            claim.eligibleLoss,
            claim.evidenceHash
        );

        claim.recoveryTokenId = recoveryTokenId;

        emit SettlementExecuted(
            commitmentTokenId,
            claim.buyer,
            claim.requestedPayout,
            recoveryTokenId,
            claim.evidenceHash
        );
    }

    /**
     * @notice Get claim details for a commitment.
     */
    function getClaim(uint256 commitmentTokenId) external view returns (Claim memory) {
        return claims[commitmentTokenId];
    }

    /**
     * @notice Check if a commitment has been settled.
     */
    function isSettled(uint256 commitmentTokenId) external view returns (bool) {
        return claims[commitmentTokenId].status == ClaimStatus.Settled;
    }

    /**
     * @notice Get claim status for a commitment.
     */
    function getClaimStatus(uint256 commitmentTokenId) external view returns (ClaimStatus) {
        return claims[commitmentTokenId].status;
    }
}
