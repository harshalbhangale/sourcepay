# DevQuest Smart Contracts

Solidity smart contracts for the DevQuest bounty platform.

## Tech Stack

- **Framework**: Hardhat
- **Language**: Solidity ^0.8.24
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Hardhat Chai Matchers
- **Network**: Ethereum (Sepolia testnet)

## Contracts

### ProjectRegistry

Registry for all DevQuest projects with project metadata and ownership tracking.

### ProjectEscrow

Escrow contract that holds PYUSD funds for projects and manages fund locking/releasing.

### FeatureTask

Manages individual tasks within projects, including assignment and submission tracking.

### PayoutDistributor

Distributes PYUSD payments to contributors based on contribution scores.

## Setup

### Prerequisites

- Node.js 18+ or Bun
- An Ethereum wallet with testnet ETH

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Compile contracts
bun run compile

# Run tests
bun run test

# Deploy to local network
bun run node          # In one terminal
bun run deploy:local  # In another terminal

# Deploy to Sepolia testnet
bun run deploy:sepolia
```

## Testing

```bash
# Run all tests
bun run test

# Run with gas reporting
REPORT_GAS=true bun run test

# Run coverage
bun run coverage
```

## Deployment

1. Set up your `.env` file with required variables
2. Get testnet ETH from Sepolia faucet
3. Deploy contracts:
   ```bash
   bun run deploy:sepolia
   ```
4. Save the deployed contract addresses
5. Verify contracts on Etherscan:
   ```bash
   bun run verify <CONTRACT_ADDRESS> --network sepolia
   ```

## Contract Addresses

After deployment, save your contract addresses here:

- **ProjectRegistry**: `TBD`
- **ProjectEscrow**: `TBD`
- **FeatureTask**: `TBD`
- **PayoutDistributor**: `TBD`
