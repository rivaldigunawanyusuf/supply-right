// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ProtectionVault
 * @notice Holds provider collateral for SupplyRight protection policies.
 * @dev Provider locks mETH collateral. Only the ClaimManager (set as authorized)
 *      can release funds for settlement. Provider can withdraw excess after settlement.
 *
 *      NON-NEGOTIABLE: Protection funding must precede the covered failure event.
 *      No retroactive coverage.
 */
contract ProtectionVault {
    IERC20 public immutable token; // mETH
    address public provider;
    address public authorizedSettler; // ClaimManager contract

    struct Policy {
        uint256 commitmentTokenId; // Links to SupplyRightNFT
        uint256 collateralAmount;
        uint256 coverageRateBps; // Basis points (2000 = 20%)
        uint256 maxPayout;
        uint256 fundedAt;
        bool active;
        bool settled;
    }

    mapping(uint256 => Policy) public policies; // commitmentTokenId => Policy
    uint256 public totalLocked;

    event PolicyFunded(
        uint256 indexed commitmentTokenId,
        address indexed provider,
        uint256 collateralAmount,
        uint256 coverageRateBps,
        uint256 maxPayout
    );
    event PayoutReleased(uint256 indexed commitmentTokenId, address indexed buyer, uint256 amount);
    event ExcessWithdrawn(uint256 indexed commitmentTokenId, address indexed provider, uint256 amount);

    modifier onlyProvider() {
        require(msg.sender == provider, "ProtectionVault: caller is not the provider");
        _;
    }

    modifier onlySettler() {
        require(msg.sender == authorizedSettler, "ProtectionVault: caller is not authorized settler");
        _;
    }

    constructor(address _token, address _provider) {
        token = IERC20(_token);
        provider = _provider;
    }

    /**
     * @notice Set the authorized settler (ClaimManager contract).
     *         Can only be set once.
     */
    function setAuthorizedSettler(address _settler) external onlyProvider {
        require(authorizedSettler == address(0), "ProtectionVault: settler already set");
        require(_settler != address(0), "ProtectionVault: zero settler address");
        authorizedSettler = _settler;
    }

    /**
     * @notice Provider funds a protection policy for a registered commitment.
     * @param commitmentTokenId The SupplyRightNFT token ID
     * @param collateralAmount Amount of mETH to lock
     * @param coverageRateBps Coverage rate in basis points (e.g., 2000 = 20%)
     */
    function fundPolicy(
        uint256 commitmentTokenId,
        uint256 collateralAmount,
        uint256 coverageRateBps
    ) external onlyProvider {
        require(commitmentTokenId > 0, "ProtectionVault: invalid commitment ID");
        require(collateralAmount > 0, "ProtectionVault: zero collateral");
        require(coverageRateBps > 0 && coverageRateBps <= 10000, "ProtectionVault: invalid coverage rate");
        require(!policies[commitmentTokenId].active, "ProtectionVault: policy already active");

        // Transfer collateral from provider to vault
        require(
            token.transferFrom(msg.sender, address(this), collateralAmount),
            "ProtectionVault: transfer failed"
        );

        uint256 maxPayout = collateralAmount; // Max payout is the locked collateral

        policies[commitmentTokenId] = Policy({
            commitmentTokenId: commitmentTokenId,
            collateralAmount: collateralAmount,
            coverageRateBps: coverageRateBps,
            maxPayout: maxPayout,
            fundedAt: block.timestamp,
            active: true,
            settled: false
        });

        totalLocked += collateralAmount;

        emit PolicyFunded(commitmentTokenId, msg.sender, collateralAmount, coverageRateBps, maxPayout);
    }

    /**
     * @notice Release payout to buyer. Only callable by the authorized settler (ClaimManager).
     * @param commitmentTokenId The commitment being settled
     * @param buyer Address to receive payout
     * @param amount Payout amount in mETH
     */
    function releasePayout(
        uint256 commitmentTokenId,
        address buyer,
        uint256 amount
    ) external onlySettler {
        Policy storage policy = policies[commitmentTokenId];
        require(policy.active, "ProtectionVault: policy not active");
        require(!policy.settled, "ProtectionVault: already settled");
        require(amount > 0 && amount <= policy.collateralAmount, "ProtectionVault: invalid payout amount");
        require(buyer != address(0), "ProtectionVault: zero buyer address");

        policy.settled = true;
        policy.active = false;
        totalLocked -= policy.collateralAmount;

        // Transfer payout to buyer
        require(token.transfer(buyer, amount), "ProtectionVault: payout transfer failed");

        emit PayoutReleased(commitmentTokenId, buyer, amount);
    }

    /**
     * @notice Provider withdraws remaining collateral after settlement.
     * @param commitmentTokenId The settled commitment
     */
    function withdrawExcess(uint256 commitmentTokenId) external onlyProvider {
        Policy storage policy = policies[commitmentTokenId];
        require(policy.settled, "ProtectionVault: not yet settled");

        uint256 excess = token.balanceOf(address(this));
        require(excess > 0, "ProtectionVault: no excess to withdraw");

        require(token.transfer(provider, excess), "ProtectionVault: excess transfer failed");

        emit ExcessWithdrawn(commitmentTokenId, provider, excess);
    }

    /**
     * @notice Get policy details for a commitment.
     */
    function getPolicy(uint256 commitmentTokenId) external view returns (Policy memory) {
        return policies[commitmentTokenId];
    }

    /**
     * @notice Check if a policy is funded and active.
     */
    function isPolicyActive(uint256 commitmentTokenId) external view returns (bool) {
        return policies[commitmentTokenId].active;
    }

    /**
     * @notice Get available collateral for a commitment.
     */
    function getCollateral(uint256 commitmentTokenId) external view returns (uint256) {
        Policy memory policy = policies[commitmentTokenId];
        if (!policy.active || policy.settled) return 0;
        return policy.collateralAmount;
    }
}
