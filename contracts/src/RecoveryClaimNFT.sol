// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title RecoveryClaimNFT
 * @notice ERC-721 representing a recovery claim right against the defaulting supplier.
 * @dev Minted atomically during settlement. The holder (initially the protection provider)
 *      gains the right to pursue recovery from the supplier for the paid-out amount.
 */
contract RecoveryClaimNFT is ERC721 {
    address public claimManager; // Only ClaimManager can mint
    uint256 private _nextTokenId;

    struct RecoveryClaim {
        uint256 commitmentTokenId;
        address supplier; // The defaulting party (off-chain reference)
        uint256 payoutAmount;
        uint256 eligibleLoss;
        uint256 mintedAt;
        bytes32 evidenceHash;
    }

    mapping(uint256 => RecoveryClaim) public recoveryClaims;

    event RecoveryClaimMinted(
        uint256 indexed tokenId,
        uint256 indexed commitmentTokenId,
        address indexed recipient,
        uint256 payoutAmount,
        uint256 eligibleLoss
    );

    modifier onlyClaimManager() {
        require(msg.sender == claimManager, "RecoveryClaimNFT: caller is not the claim manager");
        _;
    }

    constructor(address _claimManager) ERC721("SupplyRight Recovery Claim", "SRRC") {
        claimManager = _claimManager;
        _nextTokenId = 1;
    }

    /**
     * @notice Mint a recovery claim NFT. Called atomically during settlement.
     * @param recipient Who receives the recovery claim (typically provider or buyer)
     * @param commitmentTokenId The original commitment being claimed against
     * @param payoutAmount The amount paid out in settlement
     * @param eligibleLoss The verified eligible loss amount
     * @param evidenceHash Hash of the evidence documentation
     * @return tokenId The minted recovery claim token ID
     */
    function mintRecoveryClaim(
        address recipient,
        uint256 commitmentTokenId,
        uint256 payoutAmount,
        uint256 eligibleLoss,
        bytes32 evidenceHash
    ) external onlyClaimManager returns (uint256 tokenId) {
        require(recipient != address(0), "RecoveryClaimNFT: zero recipient");

        tokenId = _nextTokenId++;
        _mint(recipient, tokenId);

        recoveryClaims[tokenId] = RecoveryClaim({
            commitmentTokenId: commitmentTokenId,
            supplier: address(0), // Supplier is off-chain in MVP
            payoutAmount: payoutAmount,
            eligibleLoss: eligibleLoss,
            mintedAt: block.timestamp,
            evidenceHash: evidenceHash
        });

        emit RecoveryClaimMinted(tokenId, commitmentTokenId, recipient, payoutAmount, eligibleLoss);
    }

    /**
     * @notice Get recovery claim details.
     */
    function getRecoveryClaim(uint256 tokenId) external view returns (RecoveryClaim memory) {
        require(recoveryClaims[tokenId].mintedAt > 0, "RecoveryClaimNFT: claim not found");
        return recoveryClaims[tokenId];
    }
}
