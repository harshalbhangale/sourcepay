import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Mock MUSD Token...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy MockMUSD with initial supply of 1,000,000 MUSD
  const initialSupply = 1_000_000;
  console.log(`📦 Deploying MockMUSD with initial supply: ${initialSupply.toLocaleString()} MUSD...`);

  const MockMUSD = await ethers.getContractFactory("MockMUSD");
  const musd = await MockMUSD.deploy(initialSupply);
  await musd.waitForDeployment();

  const musdAddress = await musd.getAddress();
  console.log("✅ MockMUSD deployed to:", musdAddress);

  // Get token info
  const name = await musd.name();
  const symbol = await musd.symbol();
  const decimals = await musd.decimals();
  const totalSupply = await musd.totalSupply();

  console.log("\n📊 Token Information:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals);
  console.log("   Total Supply:", ethers.formatUnits(totalSupply, decimals), symbol);
  console.log("   Deployer Balance:", ethers.formatUnits(await musd.balanceOf(deployer.address), decimals), symbol);

  console.log("\n✅ Deployment Complete!\n");
  console.log("=" .repeat(60));
  console.log("📋 ADD THESE TO YOUR .env FILES:");
  console.log("=" .repeat(60));
  console.log(`NEXT_PUBLIC_MUSD_CONTRACT_ADDRESS=${musdAddress}`);
  console.log(`MUSD_CONTRACT_ADDRESS=${musdAddress}`);
  console.log("=" .repeat(60));

  console.log("\n🎁 FAUCET INSTRUCTIONS:");
  console.log("To mint MUSD to any address, use the faucet function:");
  console.log(`npx hardhat run scripts/mint-musd.ts --network mezoTestnet`);
  console.log("\nOr call the faucet() function directly from your wallet!");
  console.log("Anyone can mint up to 10,000 MUSD at once for testing.\n");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    musdAddress: musdAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    initialSupply: initialSupply,
  };

  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


