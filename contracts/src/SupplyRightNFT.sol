// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title SupplyRightNFT
 * @notice ERC-721 representing a registered purchase order commitment.
 * @dev Minted by the Registrar when a PO is formally registered on-chain.
 */
contract SupplyRightNFT is ERC721 {
    address public registrar;
    uint256 private _nextTokenId;

    struct Commitment {
        address buyer;
        string poId;
        uint256 totalValue;
        uint256 quantity;
        uint256 deadline;
        uint256 registeredAt;
        bool active;
    }

    mapping(uint256 => Commitment) public commitments;
    mapping(string => uint256) public poIdToTokenId;

    event CommitmentRegistered(
        uint256 indexed tokenId,
        address indexed buyer,
        string poId,
        uint256 totalValue,
        uint256 quantity,
        uint256 deadline
    );

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "SupplyRightNFT: caller is not the registrar");
        _;
    }

    constructor(address _registrar) ERC721("SupplyRight Commitment", "SRCOM") {
        registrar = _registrar;
        _nextTokenId = 1;
    }

    /**
     * @notice Register a purchase order commitment and mint an NFT to the buyer.
     * @param buyer Address of the SME buyer
     * @param poId Unique purchase order identifier
     * @param totalValue Total PO value in mETH (wei)
     * @param quantity Total quantity ordered
     * @param deadline Unix timestamp of delivery deadline
     * @return tokenId The minted NFT token ID
     */
    function registerCommitment(
        address buyer,
        string calldata poId,
        uint256 totalValue,
        uint256 quantity,
        uint256 deadline
    ) external onlyRegistrar returns (uint256 tokenId) {
        require(buyer != address(0), "SupplyRightNFT: zero buyer address");
        require(bytes(poId).length > 0, "SupplyRightNFT: empty PO ID");
        require(poIdToTokenId[poId] == 0, "SupplyRightNFT: PO already registered");
        require(deadline > block.timestamp, "SupplyRightNFT: deadline must be in the future");

        tokenId = _nextTokenId++;
        _mint(buyer, tokenId);

        commitments[tokenId] = Commitment({
            buyer: buyer,
            poId: poId,
            totalValue: totalValue,
            quantity: quantity,
            deadline: deadline,
            registeredAt: block.timestamp,
            active: true
        });

        poIdToTokenId[poId] = tokenId;

        emit CommitmentRegistered(tokenId, buyer, poId, totalValue, quantity, deadline);
    }

    /**
     * @notice Get commitment details by token ID.
     */
    function getCommitment(uint256 tokenId) external view returns (Commitment memory) {
        require(commitments[tokenId].registeredAt > 0, "SupplyRightNFT: commitment not found");
        return commitments[tokenId];
    }

    /**
     * @notice Check if a PO has been registered.
     */
    function isRegistered(string calldata poId) external view returns (bool) {
        return poIdToTokenId[poId] != 0;
    }
}
