import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting SourcePay deployment on Mezo Testnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "BTC\n"
  );

  // MUSD token address on Mezo Testnet
  const MUSD_ADDRESS = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
  console.log("✅ Using MUSD token at:", MUSD_ADDRESS, "\n");

  // Deploy ProjectRegistry
  console.log("1️⃣ Deploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  const projectRegistryAddress = await projectRegistry.getAddress();
  console.log("✅ ProjectRegistry deployed to:", projectRegistryAddress, "\n");

  // Deploy ProjectEscrow
  console.log("2️⃣ Deploying ProjectEscrow...");
  const ProjectEscrow = await ethers.getContractFactory("ProjectEscrow");
  const projectEscrow = await ProjectEscrow.deploy(MUSD_ADDRESS);
  await projectEscrow.waitForDeployment();
  const projectEscrowAddress = await projectEscrow.getAddress();
  console.log("✅ ProjectEscrow deployed to:", projectEscrowAddress, "\n");

  // Deploy FeatureTask
  console.log("3️⃣ Deploying FeatureTask...");
  const FeatureTask = await ethers.getContractFactory("FeatureTask");
  const featureTask = await FeatureTask.deploy();
  await featureTask.waitForDeployment();
  const featureTaskAddress = await featureTask.getAddress();
  console.log("✅ FeatureTask deployed to:", featureTaskAddress, "\n");

  // Deploy PayoutDistributor
  console.log("4️⃣ Deploying PayoutDistributor...");
  const PayoutDistributor = await ethers.getContractFactory(
    "PayoutDistributor"
  );
  const payoutDistributor = await PayoutDistributor.deploy(
    projectEscrowAddress,
    MUSD_ADDRESS
  );
  await payoutDistributor.waitForDeployment();
  const payoutDistributorAddress = await payoutDistributor.getAddress();
  console.log(
    "✅ PayoutDistributor deployed to:",
    payoutDistributorAddress,
    "\n"
  );

  // Authorize PayoutDistributor in ProjectEscrow
  console.log("🔐 Authorizing PayoutDistributor in ProjectEscrow...");
  const tx = await projectEscrow.addAuthorizedContract(
    payoutDistributorAddress
  );
  await tx.wait();
  console.log("✅ PayoutDistributor authorized\n");

  // Summary
  console.log("=".repeat(80));
  console.log("🎉 SourcePay Deployment Complete on Mezo Testnet!\n");
  console.log("Contract Addresses:");
  console.log("=".repeat(80));
  console.log("MUSD Token:           ", MUSD_ADDRESS);
  console.log("ProjectRegistry:      ", projectRegistryAddress);
  console.log("ProjectEscrow:        ", projectEscrowAddress);
  console.log("FeatureTask:          ", featureTaskAddress);
  console.log("PayoutDistributor:    ", payoutDistributorAddress);
  console.log("=".repeat(80));

  console.log("\n📋 Copy these addresses to your .env files:\n");

  console.log("# Backend .env");
  console.log(`MUSD_CONTRACT_ADDRESS=${MUSD_ADDRESS}`);
  console.log(`CONTRACT_PROJECT_REGISTRY=${projectRegistryAddress}`);
  console.log(`CONTRACT_PROJECT_ESCROW=${projectEscrowAddress}`);
  console.log(`CONTRACT_FEATURE_TASK=${featureTaskAddress}`);
  console.log(`CONTRACT_PAYOUT_DISTRIBUTOR=${payoutDistributorAddress}`);

  console.log("\n# Frontend .env.local");
  console.log(`NEXT_PUBLIC_MUSD_CONTRACT_ADDRESS=${MUSD_ADDRESS}`);
  console.log(
    `NEXT_PUBLIC_CONTRACT_PROJECT_REGISTRY=${projectRegistryAddress}`
  );
  console.log(`NEXT_PUBLIC_CONTRACT_PROJECT_ESCROW=${projectEscrowAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_FEATURE_TASK=${featureTaskAddress}`);
  console.log(
    `NEXT_PUBLIC_CONTRACT_PAYOUT_DISTRIBUTOR=${payoutDistributorAddress}`
  );

  console.log("\n# Contracts .env");
  console.log(`MUSD_ADDRESS=${MUSD_ADDRESS}`);
  console.log(`PROJECT_REGISTRY_ADDRESS=${projectRegistryAddress}`);
  console.log(`PROJECT_ESCROW_ADDRESS=${projectEscrowAddress}`);
  console.log(`FEATURE_TASK_ADDRESS=${featureTaskAddress}`);
  console.log(`PAYOUT_DISTRIBUTOR_ADDRESS=${payoutDistributorAddress}`);

  console.log("\n✅ Save these addresses to your .env files!");
  console.log("\n📌 Next Steps:");
  console.log("1. Copy the addresses above to your .env files");
  console.log("2. View on Mezo Explorer:");
  console.log(`   https://explorer.test.mezo.org/address/${projectRegistryAddress}`);
  console.log(`   https://explorer.test.mezo.org/address/${projectEscrowAddress}`);
  console.log(`   https://explorer.test.mezo.org/address/${featureTaskAddress}`);
  console.log(`   https://explorer.test.mezo.org/address/${payoutDistributorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


