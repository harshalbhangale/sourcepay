#!/bin/bash

echo "
╔═══════════════════════════════════════════════════════════╗
║          Deploy Mock MUSD Token - Quick Script           ║
╚═══════════════════════════════════════════════════════════╝
"

cd /Users/buddyharshal/Desktop/SourcePay/contracts

echo "📦 Step 1: Installing dependencies..."
npm install --silent

echo ""
echo "🔨 Step 2: Compiling contracts..."
npx hardhat compile

echo ""
echo "🚀 Step 3: Deploying Mock MUSD to Mezo Testnet..."
npx hardhat run scripts/deploy-mock-musd.ts --network mezoTestnet

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Copy the MUSD contract address from above"
echo "2. Update your .env files with the new address"
echo "3. Run: npx hardhat run scripts/mint-musd.ts --network mezoTestnet"
echo ""
