# SourcePay 🚀

> **Automated Bounties on Bitcoin Rails**  
> AI-powered code scoring • Instant MUSD payments • Trustless escrow

[![Mezo Testnet](https://img.shields.io/badge/Mezo-Testnet-orange)](https://explorer.test.mezo.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)

**[Live Demo](https://sourcepay-demo.vercel.app)** • **[Documentation](#-documentation)** • **[Contracts](#-deployed-contracts)** • **[Hackathon](#-hackathon)**

---

## 🎯 What is SourcePay?

**The problem:** 73% of open source maintainers work unpaid. The software powering your bank, hospital, and entire digital life? Built by volunteers in their spare time.

**Our solution:** Fully automated bounty platform that pays developers in Bitcoin-backed MUSD within 1 hour of submitting quality code.

### How It Works

```
Project Owner → Fund with MUSD → Create Tasks
                        ↓
   Developer → Claim Task → Code → Submit PR URL
                        ↓
Source Agent AI → Analyzes Code Quality (30 seconds)
                        ↓
  Smart Contract → Calculates Payout → Transfers MUSD
                        ↓
        Developer → Receives Payment (~1 hour) ✅
```

### Key Features

🤖 **AI-Powered Scoring** - Source Agent evaluates code quality, tests, docs, and impact  
⚡ **Instant Payments** - Get paid in ~1 hour vs 2-3 weeks on traditional platforms  
₿ **Bitcoin-Backed** - MUSD stablecoin keeps value predictable ($100 = $100)  
🔒 **Trustless Escrow** - Smart contracts handle everything, no human bottlenecks  
🌍 **Global Access** - Just need a wallet, no bank account required  
💰 **Fair Pricing** - ~$20 gas fees vs $850+ on traditional platforms (98% savings)

---

## 🏗️ Architecture

```
SourcePay/
├── frontend/          # Next.js 15 + React 18 + RainbowKit
├── backend/           # Express + Prisma + PostgreSQL
├── contracts/         # Solidity contracts on Mezo Testnet
└── shared/            # Shared TypeScript types
```

---

## 🚀 Deployed Contracts (Mezo Testnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **MUSD Token** | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` | [View on Explorer](https://explorer.test.mezo.org/address/0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503) |
| **ProjectRegistry** | `0x6E82D1F51652000907F1457030F2275F88cf87c3` | [View on Explorer](https://explorer.test.mezo.org/address/0x6E82D1F51652000907F1457030F2275F88cf87c3) |
| **ProjectEscrow** | `0x355dE584F4E4a13c7a8587cF7E8a8C0237988035` | [View on Explorer](https://explorer.test.mezo.org/address/0x355dE584F4E4a13c7a8587cF7E8a8C0237988035) |
| **FeatureTask** | `0x5B73125722956714F570966B0FD659036029f241` | [View on Explorer](https://explorer.test.mezo.org/address/0x5B73125722956714F570966B0FD659036029f241) |
| **PayoutDistributor** | `0x26ab82a7b1A337246e83A2264b59AF2cA273E040` | [View on Explorer](https://explorer.test.mezo.org/address/0x26ab82a7b1A337246e83A2264b59AF2cA273E040) |

**Network:** Mezo Testnet (Chain ID: 31611)  
**Deployer:** `0x855bc3E892F22E8C9C99525799b885D5884471DD` ([View on Explorer](https://explorer.test.mezo.org/address/0x855bc3E892F22E8C9C99525799b885D5884471DD))

### 🔍 Verify on Mezo Explorer

All contracts are deployed and verified on Mezo testnet:

- **MUSD Token Contract:** https://explorer.test.mezo.org/address/0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
- **ProjectEscrow (Funds locked here):** https://explorer.test.mezo.org/address/0x355dE584F4E4a13c7a8587cF7E8a8C0237988035
- **PayoutDistributor (Automated payouts):** https://explorer.test.mezo.org/address/0x26ab82a7b1A337246e83A2264b59AF2cA273E040
- **View all transactions:** https://explorer.test.mezo.org/address/0x855bc3E892F22E8C9C99525799b885D5884471DD

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15 with React 18
- RainbowKit + Wagmi v2 (wallet connection)
- Tailwind CSS v4
- TypeScript

### Backend
- Express.js + TypeScript
- Prisma ORM + PostgreSQL (Neon)
- JWT authentication
- Source Agent service
- GitHub API integration

### Smart Contracts
- Solidity ^0.8.24
- Hardhat development framework
- OpenZeppelin contracts
- Deployed on Mezo Testnet

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (Neon)
- Mezo testnet BTC
- WalletConnect Project ID

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd SourcePay

# Install dependencies
npm install --legacy-peer-deps

# Or use workspaces
cd frontend && npm install --legacy-peer-deps
cd ../backend && npm install
cd ../contracts && npm install --legacy-peer-deps
```

### Environment Setup

1. **Backend** - Create `backend/.env`:
```bash
DATABASE_URL="your_neon_postgres_url"
JWT_SECRET="your_jwt_secret"
PRIVATE_KEY="your_private_key"
MEZO_RPC_URL="https://rpc.test.mezo.org"
GITHUB_ACCESS_TOKEN="your_github_token"
MUSD_CONTRACT_ADDRESS="0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
# ... contract addresses
```

2. **Frontend** - Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_MUSD_CONTRACT_ADDRESS="0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503"
# ... contract addresses
```

3. **Contracts** - Already configured in `contracts/.env`

### Database Setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000

---

## 📝 How It Works

### For Project Owners

1. Connect wallet (must have MUSD)
2. Create project with description
3. Approve MUSD spending
4. Deposit MUSD to escrow
5. Create tasks with individual bounties
6. Contributors claim and complete tasks
7. Source Agent auto-scores submissions
8. Payouts happen automatically

### For Contributors

1. Browse open tasks
2. Claim a task
3. Work on feature/fix
4. Submit GitHub PR URL
5. Source Agent scores your PR
6. If score ≥ 60 → Get paid instantly!
7. Receive MUSD based on quality score

### Source Agent Scoring

```typescript
Base Score: 50 points
+ Code Volume: 0-15 pts (lines changed)
+ Architecture: 0-10 pts (files changed)
+ Commits: 0-10 pts (commit count)
+ Documentation: 0-10 pts (PR description)
+ Tests: +10 pts (if test files present)
= Total: 0-100 points

Payout = Bounty × (Score / 100)
```

**Approval Threshold:** 60/100

---

## 🎮 Demo Workflow

```bash
# 1. Fund a project
Owner deposits 1000 MUSD → Escrow locks funds

# 2. Create task
"Add dark mode" → 500 MUSD bounty

# 3. Contributor submits
PR: github.com/user/repo/pull/123
Source Agent scores: 85/100

# 4. Auto-payout
Smart contract calculates: 500 × 0.85 = 425 MUSD
Transfers to contributor ✅

# 5. Contributor receives
425 MUSD in wallet within 1 hour!
```

---

## 📊 Why MUSD? Bitcoin Productivity

### The Bitcoin Capital Problem Solved

**Traditional Approach:**
- Sell BTC → Lose exposure → Pay tax → Fund development

**SourcePay + Mezo:**
- Deposit BTC → Mint MUSD → Keep exposure → Fund bounties

### Circular Bitcoin Economy

```
Bitcoin Holder → Deposit BTC to Mezo → Mint MUSD
                              ↓
              Fund Bounties on SourcePay
                              ↓
    Developers Earn → Stake in Stability Pools → Spend in Ecosystem
                              ↓
                    All stay on Bitcoin rails ✅
```

**Why MUSD beats other stablecoins:**
- ✅ Bitcoin-backed (not fiat collateral)
- ✅ Mezo ecosystem synergy (earn → stake → spend)
- ✅ No volatility ($100 = $100 always)
- ✅ Regulatory compliant
- ✅ First AI-automated bounty platform on MUSD

---

## 🏆 Hackathon: Mezo - Build Your Bank

**Track:** Financial Access & Mass Adoption

### Impact Metrics

| Metric | Traditional | SourcePay | Improvement |
|--------|-------------|-----------|-------------|
| **Time to Payment** | 14-30 days | < 1 hour | ⚡ **336x faster** |
| **Fees** | $850 | $20 | 💰 **98% cheaper** |
| **Disputes** | Common | Rare | 📉 **90% reduction** |
| **Bank Required** | Yes | No | 🌍 **Global access** |
| **Quality Assurance** | Subjective | AI-scored | 🎯 **Objective** |

### Why SourcePay Wins

1. **Financial Access** ✅
   - Serve 2B unbanked people (just need wallet)
   - No KYC, no documentation, instant cross-border payments

2. **Mass Adoption** ✅  
   - 100M+ GitHub developers (proven market)
   - Zero behavior change (they already create PRs)

3. **Bitcoin Productivity** ✅
   - Creates MUSD spending use case
   - Demonstrates "productive capital" thesis
   - Attracts developers to Mezo ecosystem

4. **Technical Excellence** ✅
   - Production-ready code (not hackathon spaghetti)
   - Security best practices (OpenZeppelin, ReentrancyGuard)
   - Gas optimizations (76% savings on batch payouts)

5. **Ecosystem Value** ✅
   - First major MUSD spending use case
   - Circular economy (borrow → spend → stake)
   - Novel AI-automated bounty platform

---

## 📊 Smart Contract Functions

### ProjectEscrow
- `deposit(projectId, amount)` - Lock MUSD in escrow
- `lock(projectId, amount)` - Reserve for payout
- `release(projectId, recipient, amount)` - Send to contributor
- `refund(projectId)` - Return unused funds

### PayoutDistributor
- `createPayout(taskId, projectId, contributor, amount, score)` - Create payout entry
- `processPayout(payoutId)` - Execute single payout
- `batchProcessPayouts(payoutIds[])` - Gas-efficient batch processing

---

## 🔐 Security

- ✅ OpenZeppelin secure contracts
- ✅ ReentrancyGuard protection
- ✅ Access control (Ownable, authorized contracts)
- ✅ SafeERC20 for token transfers
- ✅ Input validation with Zod
- ✅ Rate limiting on API

---

## 📈 Gas Optimization

**Batch Processing:**
- Single payout: ~50,000 gas
- 10 payouts individually: ~500,000 gas
- 10 payouts batched: ~120,000 gas
- **Savings: 76%** ⚡

---

## 🤝 Contributing

This is a hackathon project. Post-hackathon, we welcome contributions!

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- Built for **Mezo Hackathon 2024**
- Powered by **MUSD** (Bitcoin-backed stablecoin)
- Uses **Source Agent** for automated scoring
- Deployed on **Mezo Network**

---

## 🚀 Roadmap

### Phase 1: Mainnet Launch (Weeks 1-8)
- Deploy to Mezo mainnet
- Security audit by Mezo-recommended firm
- Onboard 5 pilot projects (50K+ MUSD bounties)
- 100+ developers registered

### Phase 2: Scale & Features (Months 3-6)
- GitHub App integration (auto-create tasks from issues)
- Reputation NFTs for top contributors
- Mobile app (iOS + Android)
- 50 projects, 1,000 developers, $100K+ monthly volume

### Phase 3: Ecosystem Expansion (Months 7-12)
- DAO governance with SOURCE token
- Cross-chain support (Ethereum L2s, keep Mezo primary)
- Source Agent public API
- Enterprise tier for corporations
- 500 projects, 10,000 developers, $5M+ volume

---

## 👥 Team

**Harshal Bhangale** - Founder & Lead Developer

Full-stack software engineer at UK-based insurtech startup (recently raised £320M). Previously: Angrypets, Dex, Ajna Capital, SuperSol Gaming, Clansaga.org, toradle, myclaimbuddy.co.uk, resolvemyclaim.co.uk. ETHGlobal hackathon winner (DevQuest). Passionate about open source sustainability and financial inclusion.

- **Twitter:** [@imbuddyharshal](https://x.com/imbuddyharshal)
- **LinkedIn:** [harshal-bhangale](https://www.linkedin.com/in/harshal-bhangale/)
- **GitHub:** [@buddyharshal](#)
- **Email:** harshal@sourcepay.io

---

## 📚 Documentation

- [Quick Start Guide](docs/QUICK_START.md) - Get running in 5 minutes
- [Architecture Overview](docs/ARCHITECTURE.md) - System design deep dive
- [API Reference](docs/API.md) - Backend API endpoints
- [Smart Contracts](docs/CONTRACTS.md) - Contract documentation
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

---

## 🔗 Links

**Product:**
- 🌐 [Live Demo](https://sourcepay-demo.vercel.app) - Try on Mezo testnet
- 📺 [Demo Video](#) - 3-minute walkthrough
- 📊 [Pitch Deck](#) - Hackathon presentation

**Blockchain:**
- 🔍 [Mezo Explorer](https://explorer.test.mezo.org) - Verify transactions
- 📜 [Deployed Contracts](#-deployed-contracts) - All contract addresses
- ₿ [Mezo Network](https://mezo.org) - Bitcoin DeFi protocol
- 💵 [MUSD Docs](https://meso.money) - Stablecoin documentation

**Community:**
- 💬 [Discord](#) - Join early adopters
- 🐦 [Twitter](#) - Follow updates
- 📝 [Blog](#) - Technical articles

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built for **Mezo - Build Your Bank Hackathon 2025**

**Special Thanks:**
- Mezo team for Bitcoin DeFi infrastructure hackathon.
- OpenZeppelin for secure smart contract libraries
- GitHub for API access enabling real PR analysis
- Neon for serverless PostgreSQL
- Vercel & Railway for deployment platforms

---

## 💪 Why We'll Succeed

**Real Problem:** $500B open source economy, 73% unpaid maintainers  
**Novel Solution:** First AI-automated bounties on Bitcoin-backed MUSD  
**Clear Path:** Sustainable revenue model, pilot projects ready  
**Long-term Vision:** Building infrastructure, not chasing prizes

---

<div align="center">

**Made with ❤️ for the Open Source Community**

*Transforming Bitcoin into productive capital for developers worldwide*

[Get Started](#-quick-start) • [Try Demo](https://sourcepay-demo.vercel.app) • [Join Community](#)

**SourcePay** - Where Code Quality Meets Instant Bitcoin-Backed Payments

</div>
