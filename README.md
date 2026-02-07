# ITMCoin Exchange — Decentralized Token Exchange

![Solidity](https://img.shields.io/badge/Solidity-0.8.0-blue)
![Network](https://img.shields.io/badge/Network-Sepolia-purple)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

A decentralized cryptocurrency exchange (DEX) built on Ethereum blockchain for the ITM MBA Blockchain Developer Bootcamp. Create an ERC-20 token and trade it peer-to-peer without intermediaries.

## Smart Contract Addresses (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| Token (ITM Coin) | `0xC696c71FA5FCe603BfD8A454DB1288D05E844E26` | [View](https://sepolia.etherscan.io/address/0xC696c71FA5FCe603BfD8A454DB1288D05E844E26) |
| Exchange (DEX) | `0xED05EB3D26b8C87aC55F6c7d6e7527d41295f5b7` | [View](https://sepolia.etherscan.io/address/0xED05EB3D26b8C87aC55F6c7d6e7527d41295f5b7) |

---

## What is This Project?

This project has two main parts:

1. **ITM Coin (ITM)** - Our own cryptocurrency token (like creating your own digital currency)
2. **Exchange** - A platform where users can buy and sell ITM tokens using Ethereum (ETH)

### Key Concepts Explained

| Term | Simple Explanation |
|------|-------------------|
| **Blockchain** | A digital ledger that records all transactions, shared across many computers |
| **Ethereum** | A blockchain platform that allows us to create smart contracts and tokens |
| **Smart Contract** | A program that runs on the blockchain - once deployed, it cannot be changed |
| **ERC-20 Token** | A standard format for creating tokens on Ethereum (like ITM Coin) |
| **DEX** | Decentralized Exchange - a trading platform with no middleman |
| **MetaMask** | A browser wallet to store your cryptocurrency and interact with blockchain apps |
| **Gas Fee** | The cost to process transactions on Ethereum (paid in ETH) |
| **Testnet** | A test version of Ethereum where we use fake ETH to practice |

---

## Project Structure

```
itmcoin-exchange/
├── src/
│   ├── contracts/          # Smart contracts (Solidity code)
│   │   ├── Token.sol       # ITM Coin token contract
│   │   ├── Exchange.sol    # DEX trading contract
│   │   └── Migrations.sol  # Deployment helper
│   ├── components/         # React frontend
│   │   ├── App.js          # Main application
│   │   └── App.css         # Styling
│   └── abis/               # Compiled contract files (auto-generated)
├── migrations/             # Deployment scripts
├── test/                   # Test files
├── scripts/                # Utility scripts
├── public/                 # Static files
├── truffle-config.js       # Blockchain configuration
└── package.json            # Project dependencies
```

---

## Features

### For Users:
- Connect MetaMask wallet
- View ETH and ITM balances (wallet + exchange)
- Deposit/Withdraw ETH and ITM tokens
- Create buy or sell orders
- Fill existing orders from other users
- Cancel your own orders
- View trade history

### Technical Features:
- ERC-20 compliant token
- 10% trading fee (collected by exchange owner)
- Order book with buy/sell orders
- Real-time balance updates

---

## Prerequisites

Before you begin, install these tools:

### 1. Node.js (JavaScript runtime)
- Download from: https://nodejs.org/
- Choose the LTS (Long Term Support) version
- Verify installation: Open terminal and type `node --version`

### 2. MetaMask (Browser Wallet)
- Install the browser extension: https://metamask.io/
- Create a new wallet and **save your seed phrase securely**
- This is your digital wallet for the blockchain

### 3. Ganache (Local Blockchain) - For Local Testing Only
- Download from: https://trufflesuite.com/ganache/
- This creates a fake blockchain on your computer for testing

---

## Quick Start

### Step 1: Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This downloads all required packages (may show warnings - that's normal).

### Step 2: Create Environment File

Create a file named `.env` in the project root:

```
MNEMONIC="your twelve word metamask seed phrase here"
INFURA_KEY=your_infura_api_key
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_key
```

**Important:** Never share your seed phrase or commit `.env` to GitHub!

### Step 3: Deploy and Run

**For Sepolia Testnet (Recommended for demo):**
```bash
npx truffle compile
npx truffle migrate --network sepolia --reset
npm run start
```

**For Local Testing (Ganache):**
```bash
# Start Ganache first, then:
npx truffle compile
npx truffle migrate --reset
npx truffle exec scripts/seed-exchange.js
npm run start
```

---

## Running on Sepolia Testnet

### Step 1: Get Free Test ETH

1. Go to https://sepoliafaucet.com or https://www.alchemy.com/faucets/ethereum-sepolia
2. Enter your MetaMask wallet address
3. Request free test ETH (needed for gas fees)

### Step 2: Switch MetaMask to Sepolia

1. Open MetaMask
2. Click the network dropdown (top)
3. Select "Sepolia test network"
4. If not visible: Settings → Advanced → Show test networks → ON

### Step 3: Deploy Contracts

```bash
npx truffle migrate --network sepolia --reset
```

Save the contract addresses from the output!

### Step 4: Add ITM Token to MetaMask

1. Copy the **Token contract address** from deployment output
2. In MetaMask: Click "Import tokens" at the bottom
3. Paste the token contract address
4. Click "Add custom token"
5. You should now see your ITM balance!

### Step 5: Start the Application

```bash
npm run start
```

Open http://localhost:3000 in your browser.

---

## How to Use the Exchange

### 1. Connecting Your Wallet
- Open the app in your browser
- MetaMask will prompt you to connect
- Approve the connection
- Your wallet address appears in the top-right

### 2. Understanding the Interface

| Section | Purpose |
|---------|---------|
| **Balances** | Shows your ETH and ITM in wallet and exchange |
| **Deposit/Withdraw** | Move funds between wallet and exchange |
| **Order Book** | See all open buy and sell orders |
| **New Order** | Create your own buy or sell order |
| **My Orders** | View and cancel your orders |
| **Trade History** | See completed trades |

### 3. Trading Steps

**Before Trading - Deposit Funds:**
1. Enter amount in "Deposit ETH" or "Deposit ITM"
2. Click the deposit button
3. Confirm in MetaMask
4. Wait for transaction to confirm

**To Buy ITM:**
1. Enter amount of ITM you want
2. Enter price (ETH per ITM)
3. Click "Buy"
4. Confirm in MetaMask

**To Sell ITM:**
1. Enter amount of ITM to sell
2. Enter price (ETH per ITM)
3. Click "Sell"
4. Confirm in MetaMask

**Filling Orders:**
- Click "Buy" on a sell order to purchase
- Click "Sell" on a buy order to sell
- The person filling pays 10% fee

**Withdrawing:**
- Enter amount and click withdraw
- Funds return to your MetaMask wallet

---

## Smart Contract Details

### Token.sol (ITM Coin)

| Property | Value |
|----------|-------|
| Name | ITM Coin |
| Symbol | ITM |
| Decimals | 18 |
| Total Supply | 1,000,000 ITM |

**What it does:** Creates a digital currency that can be transferred between addresses.

### Exchange.sol (DEX)

| Property | Value |
|----------|-------|
| Fee Percent | 10% |
| Fee Recipient | Contract deployer |

**What it does:** Allows users to trade ITM tokens for ETH without a middleman.

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| `error:0308010C:digital envelope routines` | `export NODE_OPTIONS=--openssl-legacy-provider` |
| MetaMask not connecting | Refresh page, ensure correct network selected |
| "Insufficient funds" | Get test ETH from faucet |
| "Token contract not deployed" | Switch MetaMask to Sepolia network |
| Transaction stuck | Increase gas price in MetaMask |
| Balance not updating | Wait for transaction confirmation, then refresh |
| "Contract not deployed" | Run `npx truffle migrate --network sepolia --reset` |
| Order not appearing | Check you have funds deposited in exchange |

For detailed troubleshooting, see [TRAINING_DOCUMENTATION.md](TRAINING_DOCUMENTATION.md#10-troubleshooting-guide).

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Smart Contracts | Solidity 0.8.0 |
| Blockchain Framework | Truffle Suite |
| Frontend | React.js |
| Styling | Bootstrap 4 |
| Blockchain Library | Web3.js |
| Wallet | MetaMask |
| Test Network | Sepolia (via Alchemy) |

---

## Useful Links

- [Ethereum for Beginners](https://ethereum.org/en/developers/docs/intro-to-ethereum/)
- [What is a Smart Contract?](https://ethereum.org/en/developers/docs/smart-contracts/)
- [MetaMask Getting Started](https://metamask.io/faqs/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## Running Tests

To verify the smart contracts work correctly:

```bash
npx truffle test
```

Note: Requires Ganache running on port 7545.

---

## For Developers

### Compile Contracts
```bash
npx truffle compile
```

### Deploy to Local (Ganache)
```bash
npx truffle migrate --reset
```

### Deploy to Sepolia
```bash
npx truffle migrate --network sepolia --reset
```

### Run Frontend
```bash
npm run start
```

### Seed Sample Data (Local only)
```bash
npx truffle exec scripts/seed-exchange.js
```

---

## Security Notes

1. **Never share your seed phrase** - Anyone with it can access your wallet
2. **Never commit `.env` file** - It contains sensitive credentials
3. **Use test networks first** - Practice with fake ETH before using real money
4. **Verify contract addresses** - Always double-check before transacting

---

## Documentation

For comprehensive training materials including:
- Line-by-line code explanations
- ERC-20 standard mapping
- Security analysis
- Detailed troubleshooting
- Flow diagrams

See **[TRAINING_DOCUMENTATION.md](TRAINING_DOCUMENTATION.md)**

---

## License

MIT License — Educational project for ITM MBA Blockchain course.

---

**Built with Blockchain Technology**

*ITM MBA — Where Business Meets Technology*
