// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockETH} from "../src/MockETH.sol";
import {SupplyRightNFT} from "../src/SupplyRightNFT.sol";
import {ProtectionVault} from "../src/ProtectionVault.sol";
import {RecoveryClaimNFT} from "../src/RecoveryClaimNFT.sol";
import {ClaimManager} from "../src/ClaimManager.sol";

/**
 * @title Deploy
 * @notice Deploys all SupplyRight AI contracts and wires them together.
 *
 * Usage:
 *   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
 *
 * Required env vars:
 *   DEPLOYER_PRIVATE_KEY  — deploys all contracts
 *   REGISTRAR_ADDRESS     — registrar role
 *   PROVIDER_ADDRESS      — protection provider role
 *   VERIFIER_ADDRESS      — independent verifier role
 *   AGENT_ADDRESS         — AI agent wallet
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address registrar = vm.envAddress("REGISTRAR_ADDRESS");
        address provider = vm.envAddress("PROVIDER_ADDRESS");
        address verifier = vm.envAddress("VERIFIER_ADDRESS");
        address agent = vm.envAddress("AGENT_ADDRESS");

        vm.startBroadcast(deployerKey);

        // 1. Deploy MockETH
        MockETH meth = new MockETH();
        console.log("MockETH deployed at:", address(meth));

        // 2. Deploy SupplyRightNFT (registrar mints commitments)
        SupplyRightNFT commitmentNFT = new SupplyRightNFT(registrar);
        console.log("SupplyRightNFT deployed at:", address(commitmentNFT));

        // 3. Deploy ProtectionVault (provider deposits collateral)
        ProtectionVault vault = new ProtectionVault(address(meth), provider);
        console.log("ProtectionVault deployed at:", address(vault));

        // 4. Deploy RecoveryClaimNFT — needs ClaimManager address, so deploy ClaimManager first
        //    We'll use CREATE2 or deploy in stages. For simplicity, deploy ClaimManager
        //    and pass its address to RecoveryClaimNFT.

        // Calculate ClaimManager address deterministically
        // Instead, deploy RecoveryClaimNFT with a placeholder and update, or deploy in order.
        // Simplest: deploy ClaimManager first with a placeholder, then RecoveryNFT, then redeploy.
        // Actually, let's use a factory pattern or just deploy in the right order.

        // We need ClaimManager address for RecoveryClaimNFT, but ClaimManager needs RecoveryClaimNFT address.
        // Solution: Deploy RecoveryClaimNFT with deployer as temporary claimManager,
        // then deploy ClaimManager, then... no, RecoveryClaimNFT.claimManager is immutable-like.
        // Better approach: Make RecoveryClaimNFT.claimManager settable once.

        // For the demo, we'll use a two-step approach:
        // Actually, let's just predict the ClaimManager address using CREATE nonce.
        // The deployer's next nonce after RecoveryClaimNFT will deploy ClaimManager.

        // Compute expected ClaimManager address (deployer nonce + 1)
        address deployerAddr = vm.addr(deployerKey);
        uint64 currentNonce = vm.getNonce(deployerAddr);
        // RecoveryClaimNFT will be deployed at nonce `currentNonce`
        // ClaimManager will be deployed at nonce `currentNonce + 1`
        address expectedClaimManager = vm.computeCreateAddress(deployerAddr, currentNonce + 1);

        // 4. Deploy RecoveryClaimNFT with predicted ClaimManager address
        RecoveryClaimNFT recoveryNFT = new RecoveryClaimNFT(expectedClaimManager);
        console.log("RecoveryClaimNFT deployed at:", address(recoveryNFT));

        // 5. Deploy ClaimManager
        ClaimManager claimManager = new ClaimManager(
            address(vault),
            address(recoveryNFT),
            address(commitmentNFT),
            verifier,
            agent
        );
        console.log("ClaimManager deployed at:", address(claimManager));
        require(address(claimManager) == expectedClaimManager, "Deploy: ClaimManager address mismatch");

        // 6. Wire: Set ClaimManager as authorized settler on ProtectionVault
        // This must be done by the provider
        // For deployment, we log the instruction
        console.log("");
        console.log("=== POST-DEPLOYMENT SETUP (run as provider) ===");
        console.log("ProtectionVault.setAuthorizedSettler(", address(claimManager), ")");
        console.log("");

        // 7. Log all addresses for deployments/sepolia.json
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("Chain ID: 11155111 (Sepolia)");
        console.log("MockETH:", address(meth));
        console.log("SupplyRightNFT:", address(commitmentNFT));
        console.log("ProtectionVault:", address(vault));
        console.log("RecoveryClaimNFT:", address(recoveryNFT));
        console.log("ClaimManager:", address(claimManager));
        console.log("");
        console.log("Roles:");
        console.log("  Registrar:", registrar);
        console.log("  Provider:", provider);
        console.log("  Verifier:", verifier);
        console.log("  Agent:", agent);

        vm.stopBroadcast();
    }
}
