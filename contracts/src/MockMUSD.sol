// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMUSD
 * @dev Mock MUSD token for testing SourcePay on Mezo Testnet
 * This is a simple ERC20 token with minting capabilities for testing
 */
contract MockMUSD is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev Constructor that gives msg.sender initial supply
     * @param initialSupply Initial supply of tokens (in whole units, will be multiplied by 10^decimals)
     */
    constructor(uint256 initialSupply) ERC20("Mock Mezo USD", "MUSD") Ownable(msg.sender) {
        _decimals = 6; // MUSD uses 6 decimals like USDC
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints new tokens to a specified address
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint (in whole units)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * 10 ** decimals());
    }

    /**
     * @dev Mints tokens to multiple addresses (useful for airdrops/testing)
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts corresponding to each recipient (in whole units)
     */
    function batchMint(address[] memory recipients, uint256[] memory amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i] * 10 ** decimals());
        }
    }

    /**
     * @dev Allows anyone to mint tokens to themselves for testing (TESTNET ONLY!)
     * @param amount Amount of tokens to mint to caller (in whole units)
     */
    function faucet(uint256 amount) public {
        require(amount <= 10000, "Cannot mint more than 10,000 MUSD at once");
        _mint(msg.sender, amount * 10 ** decimals());
    }

    /**
     * @dev Burns tokens from the caller's account
     * @param amount Amount of tokens to burn (in whole units)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount * 10 ** decimals());
    }
}


