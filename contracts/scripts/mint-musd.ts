import { ethers } from "hardhat";

async function main() {
  console.log("💰 Minting Mock MUSD Tokens...\n");

  // Get the MUSD contract address from environment or use the deployed one
  const MUSD_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

  const [signer] = await ethers.getSigners();
  console.log("📝 Using account:", signer.address);

  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 Account ETH balance:", ethers.formatEther(balance), "ETH\n");

  // Get the MockMUSD contract
  const MockMUSD = await ethers.getContractFactory("MockMUSD");
  const musd = MockMUSD.attach(MUSD_ADDRESS);

  console.log("🔗 Connected to MockMUSD at:", MUSD_ADDRESS);

  // Check current balance
  const currentBalance = await musd.balanceOf(signer.address);
  const decimals = await musd.decimals();
  console.log("📊 Current MUSD balance:", ethers.formatUnits(currentBalance, decimals), "MUSD\n");

  // Option 1: Use faucet (anyone can call)
  console.log("🚰 Using faucet to mint 5,000 MUSD...");
  const faucetAmount = 5000;
  
  try {
    const tx = await musd.faucet(faucetAmount);
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Check new balance
    const newBalance = await musd.balanceOf(signer.address);
    console.log("📊 New MUSD balance:", ethers.formatUnits(newBalance, decimals), "MUSD");
    console.log("✨ Successfully minted:", ethers.formatUnits(newBalance - currentBalance, decimals), "MUSD\n");
  } catch (error: any) {
    console.error("❌ Error minting tokens:", error.message);
    
    // If faucet fails, try owner mint if you're the owner
    console.log("\n🔄 Trying owner mint instead...");
    try {
      const mintTx = await musd.mint(signer.address, faucetAmount);
      await mintTx.wait();
      console.log("✅ Owner mint successful!");
    } catch (mintError: any) {
      console.error("❌ Owner mint also failed:", mintError.message);
      console.log("\n💡 Tip: Make sure you have enough ETH for gas fees!");
    }
  }

  console.log("\n✅ Done!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


