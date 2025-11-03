#!/bin/bash

# SourcePay - Clean GitHub Deployment Script
# This script replaces the existing repo with a fresh commit

set -e  # Exit on any error

echo "🚀 Starting SourcePay GitHub Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/harshalbhangale/sourcepay.git"
TEMP_DIR="/tmp/sourcepay-deploy-$(date +%s)"

echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"
echo ""

# Step 1: Create .gitignore if needed
echo -e "${GREEN}Step 1: Checking .gitignore...${NC}"
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Production
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
backend/.env
frontend/.env.local
contracts/.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
backend/logs/
backend/backend.log

# Hardhat
contracts/cache/
contracts/artifacts/
contracts/typechain-types/

# Bun
bun.lockb

# Misc
.cache/
.temp/
.tmp/
EOF
fi

echo "✅ .gitignore ready"
echo ""

# Step 2: Remove existing git history
echo -e "${GREEN}Step 2: Removing existing git history...${NC}"
if [ -d .git ]; then
    echo "Removing .git directory..."
    rm -rf .git
    echo "✅ Git history removed"
else
    echo "ℹ️  No existing .git directory"
fi
echo ""

# Step 3: Initialize fresh git repository
echo -e "${GREEN}Step 3: Initializing fresh git repository...${NC}"
git init
git branch -M main
echo "✅ Fresh git repo initialized"
echo ""

# Step 4: Add remote
echo -e "${GREEN}Step 4: Adding remote origin...${NC}"
git remote add origin $REPO_URL
echo "✅ Remote added: $REPO_URL"
echo ""

# Step 5: Stage all files
echo -e "${GREEN}Step 5: Staging all files...${NC}"
git add .
echo "✅ Files staged"
echo ""

# Step 6: Show what will be committed
echo -e "${BLUE}📋 Files to be committed:${NC}"
git status --short | head -20
FILE_COUNT=$(git status --short | wc -l)
echo "... and $(($FILE_COUNT - 20)) more files" 2>/dev/null || echo ""
echo ""

# Step 7: Create commit
echo -e "${GREEN}Step 6: Creating commit...${NC}"
git commit -m "feat: complete SourcePay platform for Mezo hackathon

🚀 SourcePay - Automated Bounties on Bitcoin Rails

AI-powered bounty platform that pays developers in Bitcoin-backed MUSD
within 1 hour of submitting quality code.

## Features
- 🤖 Source Agent AI for code quality scoring
- ⚡ Instant MUSD payments (< 1 hour)
- 🔒 Smart contract escrow on Mezo testnet
- 🌍 Global access (no bank account needed)
- 💰 98% cost savings vs traditional platforms

## Tech Stack
- Frontend: Next.js 15 + RainbowKit + Wagmi v2
- Backend: Express.js + Prisma + PostgreSQL
- Contracts: Solidity on Mezo testnet
- AI: Source Agent with GitHub API integration

## Deployed Contracts (Mezo Testnet)
- MUSD Token: 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
- ProjectEscrow: 0x355dE584F4E4a13c7a8587cF7E8a8C0237988035
- PayoutDistributor: 0x26ab82a7b1A337246e83A2264b59AF2cA273E040

## Impact
- 336x faster payments (1hr vs 14-30 days)
- 98% cheaper ($20 vs $850 fees)
- 90% fewer disputes (objective AI scoring)

Built for Mezo Build Your Bank Hackathon 2025
Track: Financial Access & Mass Adoption

🌐 Live Demo: https://sourcepay-demo.vercel.app
📚 Docs: /docs
🔗 GitHub: https://github.com/harshalbhangale/sourcepay"

echo "✅ Commit created"
echo ""

# Step 8: Push to GitHub (force push to replace everything)
echo -e "${GREEN}Step 7: Pushing to GitHub...${NC}"
echo -e "${RED}⚠️  This will REPLACE all existing code on GitHub${NC}"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo "Pushing to main branch..."
git push origin main --force

echo ""
echo -e "${GREEN}✅ ✅ ✅ DEPLOYMENT COMPLETE! ✅ ✅ ✅${NC}"
echo ""
echo "🎉 Your SourcePay repository is now live at:"
echo "   https://github.com/harshalbhangale/sourcepay"
echo ""
echo "📝 Next steps:"
echo "   1. Visit the repo and verify everything looks good"
echo "   2. Update README if needed"
echo "   3. Add repository description: 'AI-powered bounty platform on Bitcoin rails'"
echo "   4. Add topics: mezo, musd, bitcoin, bounty, web3, hackathon"
echo "   5. Set website URL: https://sourcepay-demo.vercel.app"
echo ""
echo "🚀 Happy hacking!"

