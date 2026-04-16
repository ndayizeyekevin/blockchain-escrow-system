# Blockchain Escrow System - Quick Command Guide

## 1. Install Dependencies

```bash
npm install
cd frontend && npm install && cd ..
```
Installs Hardhat, ethers.js, React, and Vite packages.

---

## 2. Setup Environment Files

Create `.env` in root:
```env
SEPOLIA_PRIVATE_KEY=your_private_key_from_metamask
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

Create `frontend/.env.local`:
```env
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## 3. Compile Smart Contract

```bash
npx hardhat compile
```
Converts Solidity code to bytecode. Run this after any contract changes.

---

## 4. Run Unit Tests

```bash
npx hardhat test
```
Runs 20+ tests on local Hardhat network. Tests all contract functions.

---

## 5. Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```
Deploys contract to Sepolia blockchain. Outputs contract address.

---

## 6. Update Contract Address

After deployment, copy the contract address and update both `.env` files:
```env
ESCROW_CONTRACT_ADDRESS=0x9C5D3c402B8cD0a7d2a20B3c68EfB9C96A8d9f67
```

---

## 7. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```
Starts React app on localhost:5173. Connect MetaMask and test the interface.

---

## 8. Build Frontend for Production

```bash
cd frontend
npm run build
```
Creates optimized production build in `dist/` folder.

---

## 9. Verify Contract on Etherscan

Visit: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`

Check deployment, transactions, and state variables.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npx hardhat compile` | Compile Solidity contract |
| `npx hardhat test` | Run unit tests locally |
| `npx hardhat run scripts/deploy.js --network sepolia` | Deploy to testnet |
| `cd frontend && npm run dev` | Start frontend dev server |
| `cd frontend && npm run build` | Build for production |

---

## Common Issues

**Contract address error?**
```bash
# Update .env files with deployed address
# Restart frontend: npm run dev
```

**MetaMask not on Sepolia?**
Open MetaMask → Select "Sepolia test network" from dropdown.

**No test ETH?**
Get free Sepolia ETH: https://www.sepoliafaucet.com

**ABI mismatch error?**
```bash
npx hardhat compile
# Then restart frontend
```

---

**Network:** Sepolia Testnet (Chain ID: 11155111)  
**Explorer:** https://sepolia.etherscan.io  
**Status:** Ready for deployment ✅
