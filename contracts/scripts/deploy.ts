import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting DevQuest deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // Deploy MockPYUSD
  console.log("1️⃣ Deploying MockPYUSD...");
  const MockPYUSD = await ethers.getContractFactory("MockPYUSD");
  const mockPYUSD = await MockPYUSD.deploy();
  await mockPYUSD.waitForDeployment();
  const mockPYUSDAddress = await mockPYUSD.getAddress();
  console.log("✅ MockPYUSD deployed to:", mockPYUSDAddress);
  console.log("💵 Initial supply: 1,000,000 PYUSD minted to deployer");
  console.log(
    "🚰 Faucet enabled: Anyone can call faucet() to get 10,000 PYUSD\n"
  );

  // Deploy ProjectRegistry
  console.log("2️⃣ Deploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectRegistry = await ProjectRegistry.deploy();
  await projectRegistry.waitForDeployment();
  const projectRegistryAddress = await projectRegistry.getAddress();
  console.log("✅ ProjectRegistry deployed to:", projectRegistryAddress, "\n");

  // Deploy ProjectEscrow
  console.log("3️⃣ Deploying ProjectEscrow...");
  const ProjectEscrow = await ethers.getContractFactory("ProjectEscrow");
  const projectEscrow = await ProjectEscrow.deploy(mockPYUSDAddress);
  await projectEscrow.waitForDeployment();
  const projectEscrowAddress = await projectEscrow.getAddress();
  console.log("✅ ProjectEscrow deployed to:", projectEscrowAddress, "\n");

  // Deploy FeatureTask
  console.log("4️⃣ Deploying FeatureTask...");
  const FeatureTask = await ethers.getContractFactory("FeatureTask");
  const featureTask = await FeatureTask.deploy();
  await featureTask.waitForDeployment();
  const featureTaskAddress = await featureTask.getAddress();
  console.log("✅ FeatureTask deployed to:", featureTaskAddress, "\n");

  // Deploy PayoutDistributor
  console.log("5️⃣ Deploying PayoutDistributor...");
  const PayoutDistributor = await ethers.getContractFactory(
    "PayoutDistributor"
  );
  const payoutDistributor = await PayoutDistributor.deploy(
    projectEscrowAddress,
    mockPYUSDAddress
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
  console.log("🎉 Deployment Complete!\n");
  console.log("Contract Addresses:");
  console.log("=".repeat(80));
  console.log("MockPYUSD:            ", mockPYUSDAddress);
  console.log("ProjectRegistry:      ", projectRegistryAddress);
  console.log("ProjectEscrow:        ", projectEscrowAddress);
  console.log("FeatureTask:          ", featureTaskAddress);
  console.log("PayoutDistributor:    ", payoutDistributorAddress);
  console.log("=".repeat(80));

  console.log("\n📋 Copy these addresses to your .env files:\n");

  console.log("# Backend .env");
  console.log(`PYUSD_CONTRACT_ADDRESS=${mockPYUSDAddress}`);
  console.log(`CONTRACT_PROJECT_REGISTRY=${projectRegistryAddress}`);
  console.log(`CONTRACT_PROJECT_ESCROW=${projectEscrowAddress}`);
  console.log(`CONTRACT_FEATURE_TASK=${featureTaskAddress}`);
  console.log(`CONTRACT_PAYOUT_DISTRIBUTOR=${payoutDistributorAddress}`);

  console.log("\n# Frontend .env.local");
  console.log(`NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS=${mockPYUSDAddress}`);
  console.log(
    `NEXT_PUBLIC_CONTRACT_PROJECT_REGISTRY=${projectRegistryAddress}`
  );
  console.log(`NEXT_PUBLIC_CONTRACT_PROJECT_ESCROW=${projectEscrowAddress}`);
  console.log(`NEXT_PUBLIC_CONTRACT_FEATURE_TASK=${featureTaskAddress}`);
  console.log(
    `NEXT_PUBLIC_CONTRACT_PAYOUT_DISTRIBUTOR=${payoutDistributorAddress}`
  );

  console.log("\n# Contracts .env");
  console.log(`PYUSD_ADDRESS=${mockPYUSDAddress}`);
  console.log(`PROJECT_REGISTRY_ADDRESS=${projectRegistryAddress}`);
  console.log(`PROJECT_ESCROW_ADDRESS=${projectEscrowAddress}`);
  console.log(`FEATURE_TASK_ADDRESS=${featureTaskAddress}`);
  console.log(`PAYOUT_DISTRIBUTOR_ADDRESS=${payoutDistributorAddress}`);

  console.log("\n✅ Save these addresses to your .env files!");
  console.log("\n� Next Steps:");
  console.log("1. Copy the addresses above to your .env files");
  console.log("2. Call faucet() on MockPYUSD to get 10,000 test PYUSD tokens");
  console.log("3. Verify contracts on Etherscan (optional):");
  console.log(`   bunx hardhat verify --network sepolia ${mockPYUSDAddress}`);
  console.log(
    `   bunx hardhat verify --network sepolia ${projectRegistryAddress}`
  );
  console.log(
    `   bunx hardhat verify --network sepolia ${projectEscrowAddress} ${mockPYUSDAddress}`
  );
  console.log(`   bunx hardhat verify --network sepolia ${featureTaskAddress}`);
  console.log(
    `   bunx hardhat verify --network sepolia ${payoutDistributorAddress} ${projectEscrowAddress} ${mockPYUSDAddress}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
