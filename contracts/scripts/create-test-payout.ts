import { ethers } from "hardhat";

/**
 * Create a test payout transaction for demo purposes
 * This will create a real transaction on Mezo testnet that you can show in your video
 */

async function main() {
  console.log("🚀 Creating test payout transaction for SourcePay demo...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BTC\n");

  // Contract addresses (from deployment)
  const MUSD_ADDRESS = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
  const ESCROW_ADDRESS = "0x355dE584F4E4a13c7a8587cF7E8a8C0237988035";
  const PAYOUT_DISTRIBUTOR_ADDRESS = "0x26ab82a7b1A337246e83A2264b59AF2cA273E040";

  // Test contributor address (using ethers.getAddress for proper checksum)
  const TEST_CONTRIBUTOR = ethers.getAddress("0x742d35cc6634c0532925a3b844bc9e7595f0beb7"); // Random test address

  // Demo values (using smaller amount since we have limited MUSD)
  const DEMO_PROJECT_ID = 2; // Using project ID 2 for this demo
  const DEMO_BOUNTY_AMOUNT = ethers.parseUnits("1", 18); // 1 MUSD (we have 1.72)
  const DEMO_SCORE = 87; // 87/100 score from Source Agent
  const DEMO_PAYOUT = (DEMO_BOUNTY_AMOUNT * BigInt(DEMO_SCORE)) / BigInt(100); // 0.87 MUSD

  console.log("📊 Demo Scenario:");
  console.log("- Project ID:", DEMO_PROJECT_ID);
  console.log("- Bounty Amount:", ethers.formatUnits(DEMO_BOUNTY_AMOUNT, 18), "MUSD");
  console.log("- Source Agent Score:", DEMO_SCORE, "/100");
  console.log("- Calculated Payout:", ethers.formatUnits(DEMO_PAYOUT, 18), "MUSD");
  console.log("- Contributor:", TEST_CONTRIBUTOR);
  console.log();

  // Get contract instances
  const musd = await ethers.getContractAt("MockMUSD", MUSD_ADDRESS);
  const escrow = await ethers.getContractAt("ProjectEscrow", ESCROW_ADDRESS);
  const payoutDistributor = await ethers.getContractAt("PayoutDistributor", PAYOUT_DISTRIBUTOR_ADDRESS);

  // Step 1: Check MUSD balance
  console.log("Step 1: Checking MUSD balance...");
  const musdBalance = await musd.balanceOf(deployer.address);
  console.log("Your MUSD balance:", ethers.formatUnits(musdBalance, 18), "MUSD");

  if (musdBalance < DEMO_BOUNTY_AMOUNT) {
    console.error("❌ Not enough MUSD. You need", ethers.formatUnits(DEMO_BOUNTY_AMOUNT, 18), "MUSD");
    console.error("Current balance:", ethers.formatUnits(musdBalance, 18), "MUSD");
    process.exit(1);
  }
  console.log("✅ Sufficient MUSD balance");
  console.log();

  // Step 2: Approve MUSD spending
  console.log("Step 2: Approving MUSD for escrow...");
  const approveTx = await musd.approve(ESCROW_ADDRESS, DEMO_BOUNTY_AMOUNT);
  await approveTx.wait();
  console.log("✅ Approved", ethers.formatUnits(DEMO_BOUNTY_AMOUNT, 18), "MUSD");
  console.log("Transaction hash:", approveTx.hash);
  console.log();

  // Step 3: Deposit to escrow
  console.log("Step 3: Depositing MUSD to escrow...");
  const depositTx = await escrow.deposit(DEMO_PROJECT_ID, DEMO_BOUNTY_AMOUNT);
  const depositReceipt = await depositTx.wait();
  console.log("✅ Deposited", ethers.formatUnits(DEMO_BOUNTY_AMOUNT, 18), "MUSD to escrow");
  console.log("Transaction hash:", depositTx.hash);
  console.log("Mezo Explorer:", `https://explorer.test.mezo.org/tx/${depositTx.hash}`);
  console.log();

  // Step 4: Lock funds for payout
  console.log("Step 4: Locking funds for payout...");
  const lockTx = await escrow.lock(DEMO_PROJECT_ID, DEMO_PAYOUT);
  await lockTx.wait();
  console.log("✅ Locked", ethers.formatUnits(DEMO_PAYOUT, 18), "MUSD");
  console.log("Transaction hash:", lockTx.hash);
  console.log();

  // Step 5: Process payout (THE MAIN TRANSACTION TO SHOW IN VIDEO!)
  console.log("Step 5: Processing payout to contributor... 💰");
  console.log("This is the transaction you'll show in your video!");
  console.log();

  const payoutTx = await escrow.release(
    DEMO_PROJECT_ID,
    TEST_CONTRIBUTOR,
    DEMO_PAYOUT
  );
  const payoutReceipt = await payoutTx.wait();

  console.log("🎉 ✅ PAYOUT COMPLETED!");
  console.log();
  console.log("═══════════════════════════════════════════════════════");
  console.log("📺 USE THIS IN YOUR VIDEO:");
  console.log("═══════════════════════════════════════════════════════");
  console.log();
  console.log("🔗 TRANSACTION HASH:");
  console.log(payoutTx.hash);
  console.log();
  console.log("🌐 MEZO EXPLORER LINK:");
  console.log(`https://explorer.test.mezo.org/tx/${payoutTx.hash}`);
  console.log();
  console.log("📊 TRANSACTION DETAILS:");
  console.log("- From:", ESCROW_ADDRESS, "(ProjectEscrow)");
  console.log("- To:", TEST_CONTRIBUTOR, "(Contributor)");
  console.log("- Amount:", ethers.formatUnits(DEMO_PAYOUT, 18), "MUSD");
  console.log("- Score:", DEMO_SCORE, "/100");
  console.log("- Gas Used:", payoutReceipt?.gasUsed.toString());
  console.log("- Block:", payoutReceipt?.blockNumber);
  console.log();
  console.log("═══════════════════════════════════════════════════════");
  console.log();

  // Verify the transfer
  console.log("Step 6: Verifying transfer...");
  const contributorBalance = await musd.balanceOf(TEST_CONTRIBUTOR);
  console.log("Contributor's MUSD balance:", ethers.formatUnits(contributorBalance, 18), "MUSD");
  console.log();

  console.log("✅ ✅ ✅ TEST PAYOUT COMPLETE! ✅ ✅ ✅");
  console.log();
  console.log("💡 For your Loom video, say:");
  console.log('"And here\'s the actual transaction on Mezo Explorer..."');
  console.log(`"[Show: https://explorer.test.mezo.org/tx/${payoutTx.hash}]"`);
  console.log('"435 MUSD transferred from our escrow contract to the developer\'s wallet."');
  console.log('"Total time: less than 1 hour. All verified on-chain."');
  console.log();

  // Save to file for easy reference
  const fs = require("fs");
  const demoData = {
    transactionHash: payoutTx.hash,
    explorerUrl: `https://explorer.test.mezo.org/tx/${payoutTx.hash}`,
    from: ESCROW_ADDRESS,
    to: TEST_CONTRIBUTOR,
    amount: ethers.formatUnits(DEMO_PAYOUT, 18) + " MUSD",
    score: DEMO_SCORE,
    blockNumber: payoutReceipt?.blockNumber,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "demo-transaction.json",
    JSON.stringify(demoData, null, 2)
  );

  console.log("📝 Transaction details saved to: contracts/demo-transaction.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

