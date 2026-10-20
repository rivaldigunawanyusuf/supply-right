// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockETH (mETH)
 * @notice Valueless mock ERC-20 token for SupplyRight AI testnet demonstration.
 * @dev This token has NO monetary value. It simulates collateral and payouts
 *      on Ethereum Sepolia for competition purposes only.
 */
contract MockETH is ERC20 {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "MockETH: caller is not the owner");
        _;
    }

    constructor() ERC20("Mock ETH", "mETH") {
        owner = msg.sender;
    }

    /**
     * @notice Mint tokens to an address. Only owner can mint.
     * @param to Recipient address
     * @param amount Amount in wei (18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens from caller's balance.
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
