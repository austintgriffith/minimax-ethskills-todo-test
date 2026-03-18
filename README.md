# 📋 onchain TodoList

A simple onchain todo list dApp on Base — built following [ethskills.com](https://ethskills.com).

## What it does

- Create todos stored permanently on Base
- Mark todos complete / incomplete
- Delete todos
- Fully onchain — no backend, no database, your todos live forever on Ethereum

## Stack

- **Smart contracts:** Solidity + Foundry
- **Frontend:** Next.js + Scaffold-ETH 2 + wagmi + RainbowKit
- **Chain:** Base (mainnet)

## Setup

```bash
# Install all dependencies
yarn install:all

# Start a local fork of Base (Terminal 1)
yarn fork

# Deploy contracts to local fork (Terminal 2)
yarn deploy:local

# Start the frontend (Terminal 3)
yarn dev
```

## Deploy to Base Sepolia

```bash
# Fund your deployer wallet with Sepolia ETH first, then:
cd packages/foundry
cp .env.example .env
# Add your private key and RPC URL to .env
yarn deploy:sepolia
```

## Deploy to Base Mainnet

```bash
# After testing on Sepolia:
yarn deploy:mainnet
```

## Test

```bash
cd packages/foundry
forge test
```

## Build for IPFS

```bash
cd packages/nextjs
rm -rf .next out
NEXT_PUBLIC_IPFS_BUILD=true yarn build
yarn bgipfs upload out
```
