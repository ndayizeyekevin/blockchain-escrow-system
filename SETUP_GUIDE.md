# Blockchain Escrow System - Setup & Deployment Guide

Welcome to the **Blockchain-Based Freelance Escrow Payment System**! This comprehensive guide will help you set up, deploy, and run the entire project locally.

## Project Overview

This is a decentralized escrow platform built with:
- **Smart Contracts**: Solidity (EVM)
- **Development Framework**: Hardhat
- **Frontend**: React + Vite
- **Blockchain Interaction**: ethers.js
- **Network**: Ethereum Sepolia Testnet
- **Wallet**: MetaMask

### How It Works

1. **Client** creates an escrow and deposits ETH into the smart contract
2. **Client** specifies the freelancer's wallet address
3. **Freelancer** submits their completed work
4. **Client** reviews and approves the work
5. **Smart contract** automatically releases the payment to the freelancer

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** - [Download](https://yarnpkg.com/)
- **Git** - [Download](https://git-scm.com/)
- **MetaMask Browser Extension** - [Download](https://metamask.io/)

### Verify Installation

```bash
node --version  # Should be v16+
npm --version   # Should be 7+
git --version   # Any version
```

---

## Step 1: Initial Setup

### 1.1 Navigate to Project Directory

```bash
cd d:\Courseworks\B-Tech\assignment
```

### 1.2 Install Dependencies

```bash
# Install Hardhat and contract dependencies
npm install
```

### 1.3 Create Environment File

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` file and add your MetaMask wallet private key:

```plaintext
SEPOLIA_PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=optional_for_verification
```

> **⚠️ Important**: Never commit the `.env` file. Always keep private keys secure!

### How to Get Your Private Key from MetaMask

1. Open MetaMask browser extension
2. Click the account icon (top-right)
3. Click "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key and paste in `.env` file

---

## Step 2: Compile Smart Contract

### 2.1 Compile the Solidity Contract

```bash
npm run compile
```

**Expected Output**:
- Contract compiled successfully
- ABI generated in `artifacts/` folder

### 2.2 Verify Compilation

```bash
ls artifacts/contracts/
```

You should see `EscrowPayment.sol/EscrowPayment.json`

---

## Step 3: Test Smart Contract (Optional but Recommended)

### 3.1 Run Unit Tests

```bash
npm run test
```

This will run all tests in the `test/` directory against a local Hardhat network.

**Expected Results**:
- 20+ test cases should pass
- No warnings or errors

### 3.2 Test Coverage

The test suite covers:
- ✅ Escrow creation
- ✅ Work submission
- ✅ Work approval and payment release
- ✅ Access control (only client/freelancer can call certain functions)
- ✅ Error handling and edge cases

---

## Step 4: Deploy to Sepolia Testnet

Before deploying, ensure you have **Sepolia ETH**:
- Get free ETH from [Sepolia Faucet](https://www.sepoliafaucet.io)
- You need at least 0.01 Sepolia ETH for gas fees

### 4.1 Deploy Contract

```bash
npm run deploy:sepolia
```

**What Happens**:
1. Contract is compiled
2. Deployment script executes
3. Contract is deployed to Sepolia testnet
4. You receive the **contract address**

**Example Output**:
```
Starting contract deployment...

Deploying contract from account: 0x1234...5678

Deploying EscrowPayment contract...
✓ Contract deployed successfully!

============================================================
Deployment Summary:
============================================================
Contract Address: 0xAbCdEf1234567890AbCdEf1234567890AbCdEf12
Deployer Address: 0x1234567890123456789012345678901234567890
Network: sepolia
Chain ID: 11155111
============================================================

Next steps:
1. Copy the contract address above
2. Add it to your .env file as ESCROW_CONTRACT_ADDRESS
3. Use the contract address in your frontend application

View on Etherscan: https://sepolia.etherscan.io/address/0xAbCdEf...
```

### 4.2 Save Contract Address

Copy the contract address from the deployment output and update:

**In project root `.env`**:
```plaintext
ESCROW_CONTRACT_ADDRESS=0xAbCdEf1234567890AbCdEf1234567890AbCdEf12
```

**In frontend `.env.local`**:
```plaintext
VITE_CONTRACT_ADDRESS=0xAbCdEf1234567890AbCdEf1234567890AbCdEf12
```

---

## Step 5: Setup and Run Frontend

### 5.1 Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 5.2 Create Frontend Environment File

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```plaintext
VITE_CONTRACT_ADDRESS=0xAbCdEf1234567890AbCdEf1234567890AbCdEf12
```

### 5.3 Start Development Server

```bash
npm run frontend
```

**Expected Output**:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Visit `http://localhost:5173/` in your browser.

---

## Step 6: Test with MetaMask

### 6.1 Setup MetaMask for Sepolia

1. **Open MetaMask** in your browser
2. **Enable Test Networks**:
   - Click Settings
   - Go to Advanced
   - Enable "Show test networks"

3. **Switch to Sepolia Network**:
   - In the network selector (top of MetaMask)
   - Select "Sepolia"

### 6.2 Create/Import Test Accounts

For testing, you need **two** MetaMask accounts:

**Option A: Use Existing Accounts**
- You likely already have a default account
- Create another account in MetaMask:
  - Click account icon → Create Account
  - Give it a name (e.g., "Freelancer")

**Option B: Import Private Keys**
- Client Account: Import the private key you deployed with
- Freelancer Account: Generate a new account or import another

### 6.3 Get Test ETH

For both accounts, get Sepolia ETH:
1. Visit [Sepolia Faucet](https://www.sepoliafaucet.io)
2. Connect your wallet
3. Request 0.05 Sepolia ETH
4. Wait for confirmation
5. Repeat for second account

---

## Step 7: End-to-End Testing

### 7.1 Test Workflow

**Switch to Client Account** (the one that deployed the contract):

1. **Open Frontend**: http://localhost:5173
2. **Connect Wallet**: Click "Connect MetaMask"
3. **Approve Connection**: MetaMask will ask permission
4. **Verify Network**: Should show "🟢 Sepolia"

**Create Escrow**:
1. In the "Client Dashboard" section
2. Enter **Freelancer Address**: Get from MetaMask → Account Details
3. Enter **Amount**: 0.01 ETH
4. Enter **Description**: "Design a website landing page"
5. Click "💳 Create Escrow"
6. Approve in MetaMask
7. Wait for transaction confirmation

**Switch to Freelancer Account** (in MetaMask):

1. **MetaMask**: Switch to freelancer account
2. **Frontend**: Refresh page (Frontend will auto-detect account)
3. Should show "⏱️ Pending Work Submission" status

**Submit Work**:
1. In "Freelancer Dashboard"
2. Enter work submission details
3. Click "📤 Submit Work"
4. Approve in MetaMask
5. Wait for confirmation

**Switch Back to Client Account**:

1. **MetaMask**: Switch to client account
2. **Refresh** frontend page
3. Status should show "👀 Waiting for Approval"

**Approve and Release Payment**:
1. Click "✅ Approve & Release Payment"
2. Confirm in MetaMask
3. Wait for confirmation
4. Status changes to "✅ Completed"

**Verify Payment**:
1. Switch to freelancer account
2. Check MetaMask balance - should be increased by 0.01 ETH (minus gas fees)

---

## Troubleshooting

### Problem: "Contract address not configured"

**Solution**:
```bash
# 1. Deploy contract again
npm run deploy:sepolia

# 2. Copy contract address from output

# 3. Update frontend/.env.local
VITE_CONTRACT_ADDRESS=0x...

# 4. Restart frontend
npm run frontend
```

### Problem: MetaMask shows "Network not found"

**Solution**:
1. Manually add Sepolia to MetaMask:
   - Settings → Networks → Add Network Manually
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/
   - Chain ID: 11155111
   - Currency: ETH
   - Block Explorer: https://sepolia.etherscan.io

### Problem: Transaction fails with "insufficient funds"

**Solution**:
- You need Sepolia ETH for gas fees
- Get from [Sepolia Faucet](https://www.sepoliafaucet.io)
- Wait 30 seconds for confirmation

### Problem: "Only client can call this function"

**Solution**:
- Make sure you're using the correct MetaMask account
- The account that created the escrow is the client
- Only that account can approve work

### Problem: Contract doesn't appear deployed

**Solution**:
```bash
# Check Etherscan
# 1. Visit https://sepolia.etherscan.io
# 2. Paste your contract address
# 3. Should show contract details

# Or redeploy
npm run deploy:sepolia
```

---

## Project Structure

```
blockchain-escrow-system/
├── contracts/
│   └── EscrowPayment.sol          # Smart contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── test/
│   └── EscrowPayment.test.js       # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/             # React components
│   │   ├── utils/                  # Web3 utilities
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # Entry point
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   └── package.json                # Frontend dependencies
├── artifacts/                      # Generated ABIs (compiled contracts)
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Root dependencies
└── README.md                       # This file
```

---

## Smart Contract Features

### Core Functions

1. **`createEscrow(freelancerAddress, description)`**
   - Called by client
   - Deposits ETH into contract
   - Specifies freelancer address

2. **`submitWork(submissionDetails)`**
   - Called by freelancer
   - Records work submission
   - Freelancer cannot call after payment released

3. **`approveWork()`**
   - Called by client
   - Marks work as approved
   - Automatically releases payment

4. **`cancelEscrow()`**
   - Called by client
   - Refunds ETH before work submission
   - Cannot be called after work submitted

5. **`getEscrowStatus()`**
   - View function
   - Returns all contract details
   - Can be called by anyone

### Security Features

- ✅ Access control (only client/freelancer)
- ✅ Reentrancy protection (payment released last)
- ✅ State validation (work submitted before approval)
- ✅ Zero address checks
- ✅ Proper error messages

---

## Frontend Features

### User Interface Components

1. **Header**: Wallet connection + network display
2. **Client Dashboard**: Create escrow, monitor status
3. **Freelancer Dashboard**: Submit work, receive approvals
4. **Status Monitor**: Real-time escrow state tracking
5. **Error Handling**: User-friendly error messages

### Smart Contract Interaction

- Connect/disconnect MetaMask
- Detect account changes
- Network switching (Sepolia)
- Contract method calls
- Transaction monitoring
- Balance/status updates

---

## Additional Commands

### Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat node
npm run node

# Deploy to local node
npm run deploy:local

# Start frontend
npm run frontend
```

### Deployment

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Look at accounts
npx hardhat accounts
```

---

## Common Use Cases

### Scenario 1: Web Design Project

1. **Client**: Creates escrow with 0.5 ETH
2. **Client**: Specifies freelancer address
3. **Client**: Sets description: "Design company website"
4. **Freelancer**: Submits work after designing
5. **Client**: Reviews and approves
6. **Payment**: 0.5 ETH released to freelancer

### Scenario 2: Bug Bounty

1. **Company**: Creates escrow with 1.0 ETH
2. **Company**: Specifies security auditor address
3. **Auditor**: Submits security report
4. **Company**: Reviews report and approves
5. **Payment**: 1.0 ETH sent to auditor

### Scenario 3: Content Creation

1. **Author**: Creates escrow for 0.2 ETH
2. **Author**: Sets description: "Article writing"
3. **Writer**: Submits 1000-word article
4. **Author**: Reviews quality and approves
5. **Payment**: 0.2 ETH released to writer

---

## Important Security Notes

🔒 **Safety Checklist**:

- [ ] Never share your private key
- [ ] Never commit `.env` file to git
- [ ] Use .gitignore to exclude `.env`
- [ ] Only use testnet for development
- [ ] In production, use hardware wallet
- [ ] Test thoroughly before mainnet deployment
- [ ] Always review contract code before deployment
- [ ] Use low transaction values for initial testing

---

## Learning Resources

### Smart Contracts
- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)

### Frontend
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [ethers.js Documentation](https://docs.ethers.org/v6/)

### Blockchain
- [Ethereum Docs](https://ethereum.org/developers)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Sepolia Faucet](https://www.sepoliafaucet.io)

---

## Deployment to Production

When ready to deploy to Ethereum Mainnet:

1. **Review all code** for security vulnerabilities
2. **Increase test coverage** to 100%
3. **Get smart contract audited** by security firm
4. **Use mainnet ETH** instead of testnet
5. **Update RPC endpoints** to mainnet
6. **Enable Etherscan verification** for transparency

---

## Support & Troubleshooting

### Getting Help

1. Check [Hardhat Documentation](https://hardhat.org/docs)
2. Check [ethers.js API Docs](https://docs.ethers.org/)
3. Check [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
4. Enable debug logging: `DEBUG=* npm run deploy:sepolia`

### Gas Fee Optimization

- Current contract uses ~150,000 gas for deployment
- Typical transaction costs: 0.001-0.005 Sepolia ETH
- Monitor rates: [Sepolia Gas Tracker](https://sepolia.etherscan.io/gastracker)

---

## Next Steps

### Enhancements to Consider

1. **Milestone-based Payments**: Multiple work submissions
2. **Dispute Resolution**: Escrow hold for disagreements
3. **Reviews & Ratings**: Freelancer reputation system
4. **Multi-sig Wallets**: Enhanced security for large escrows
5. **Time-locked Releases**: Automatic refund after timeout
6. **Token Payments**: Accept ERC-20 tokens, not just ETH
7. **Batch Operations**: Create multiple escrows at once

### Testing Improvements

1. Add integration tests
2. Add stress tests
3. Add security audit checklist
4. Gas optimization testing

---

## License

This project is provided as-is for educational purposes.

---

## Support

For questions or issues, please:
1. Check documentation above
2. Review smart contract comments
3. Check test cases for usage examples
4. Verify MetaMask configuration

---

**Built with ❤️ for Web3 Development Education**

Happy coding! Good luck with your blockchain escrow system! 🚀
