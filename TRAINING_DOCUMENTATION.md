# ITMCoin Exchange — Comprehensive Training Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Smart Contracts](#2-smart-contracts)
   - [Token.sol — ERC-20 Token](#21-tokensol--erc-20-token)
   - [Exchange.sol — Decentralized Exchange](#22-exchangesol--decentralized-exchange)
   - [Migrations.sol — Truffle Helper](#23-migrationssol--truffle-helper)
3. [Migration Scripts](#3-migration-scripts)
4. [Frontend Application](#4-frontend-application)
   - [State Management](#42-state-management-react-state)
   - [App.css Styling](#43-appcss--styling-documentation)
5. [Configuration Files](#5-configuration-files)
6. [Test Files](#6-test-files)
7. [Utility Scripts](#7-utility-scripts)
8. [Deployment Guide](#8-deployment-guide)
9. [Security Analysis](#9-security-analysis)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Etherscan Verification Guide](#11-etherscan-verification-guide)
12. [Flow Diagrams](#12-flow-diagrams)
13. [Glossary](#13-glossary)
14. [Appendix: Converting to Word Document](#appendix-converting-to-word-document)

---

## 1. Project Overview

### What is ITMCoin Exchange?

ITMCoin Exchange is a **Decentralized Cryptocurrency Exchange (DEX)** built on the Ethereum blockchain. It demonstrates two fundamental blockchain concepts:

1. **ERC-20 Token Creation** — Creating our own digital currency (ITM Coin)
2. **Decentralized Trading** — Exchanging tokens without a middleman

### Deployed Contract Addresses (Sepolia Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| Token (ITM Coin) | `0xC696c71FA5FCe603BfD8A454DB1288D05E844E26` | The ERC-20 token |
| Exchange (DEX) | `0xED05EB3D26b8C87aC55F6c7d6e7527d41295f5b7` | Trading platform |
| Migrations | `0x129446E8939e8aD0f314eD57d83e058516Fa15c8` | Deployment tracker |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   React     │───▶│   Web3.js   │───▶│  MetaMask   │     │
│  │   App.js    │    │   Library   │    │   Wallet    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ETHEREUM BLOCKCHAIN                        │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   Token.sol     │◀───────▶│  Exchange.sol   │           │
│  │   (ITM Coin)    │         │     (DEX)       │           │
│  └─────────────────┘         └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Smart Contracts

### 2.1 Token.sol — ERC-20 Token

**Location:** `src/contracts/Token.sol`

**Purpose:** Creates the ITM Coin cryptocurrency that users can hold, transfer, and trade.

#### What is ERC-20?

ERC-20 is a **standard interface** for tokens on Ethereum. Think of it as a "template" that all tokens follow, so wallets and exchanges can work with any token the same way.

Reference: [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)

#### ERC-20 Function Mapping with Line References

| ERC-20 Requirement | Line Numbers | What It Does |
|--------------------|-------------|--------------|
| `name()` | Line 9 | Returns `"ITM Coin"` — Human-readable token name |
| `symbol()` | Line 10 | Returns `"ITM"` — Short ticker (like stock symbols) |
| `decimals()` | Line 11 | Returns `18` — Smallest unit (1 ITM = 10^18 units) |
| `totalSupply()` | Line 12 | Returns `1,000,000 * 10^18` — Total tokens in existence |
| `balanceOf(address)` | Line 16 | `mapping(address => uint256)` — Check anyone's balance |
| `allowance(owner, spender)` | Line 20 | Nested mapping — Check spending authorization |
| `Transfer` event | Line 24 | Emitted on transfers — Notifies the blockchain |
| `Approval` event | Line 25 | Emitted on approvals — Notifies the blockchain |
| `constructor()` | Lines 29-32 | Mints all tokens to deployer |
| `transfer(to, value)` | Lines 37-41 | Moves tokens directly to another address |
| `_transfer()` (internal) | Lines 45-50 | Internal helper that moves tokens and emits event |
| `approve(spender, value)` | Lines 55-60 | Sets spending allowance for another address |
| `transferFrom(from, to, value)` | Lines 67-73 | Delegated transfer on behalf of another user |

#### Line-by-Line Code Explanation

```solidity
// SPDX-License-Identifier: MIT
// ↑ License identifier (required since Solidity 0.6.8)

pragma solidity ^0.8.0;
// ↑ Compiler version: 0.8.0 or higher. Includes overflow protection!

contract Token {
    // STATE VARIABLES (stored permanently on blockchain)

    string public name = "ITM Coin";
    // ↑ Token name. 'public' auto-generates a getter function.

    string public symbol = "ITM";
    // ↑ Token symbol (like "BTC" for Bitcoin)

    uint256 public decimals = 18;
    // ↑ 18 decimals is standard (same as ETH)
    // 1 ITM = 1,000,000,000,000,000,000 base units

    uint256 public totalSupply;
    // ↑ Total tokens created (set in constructor)

    mapping(address => uint256) public balanceOf;
    // ↑ THE LEDGER: maps each address to their balance
    // Think of it as: {"0x123...": 1000, "0x456...": 500}

    mapping(address => mapping(address => uint256)) public allowance;
    // ↑ SPENDING PERMISSIONS: owner → spender → amount
    // Example: allowance[Alice][Exchange] = 100
    // Means: Exchange can spend up to 100 of Alice's tokens
```

#### Constructor — Token Creation

```solidity
    constructor(uint256 _totalSupply) {
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
    }
    // ↑ CONSTRUCTOR runs ONCE when contract is deployed
    // - Sets total supply to the provided value
    // - Gives ALL tokens to the deployer (msg.sender)
    // - msg.sender = the address that deployed this contract
```

#### Transfer Function — Direct Token Transfer

```solidity
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        // ↑ SECURITY CHECK: Can't send more than you have
        // require() reverts the entire transaction if false

        _transfer(msg.sender, _to, _value);
        return true;
    }
```

**Real-world analogy:** Like handing cash directly to someone.

#### Internal Transfer Function

```solidity
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "Cannot transfer to zero address");
        // ↑ Prevents accidental burning (sending to 0x000...000)

        balanceOf[_from] -= _value;   // Decrease sender's balance
        balanceOf[_to] += _value;     // Increase receiver's balance
        // ↑ Solidity 0.8.0+ has built-in overflow protection!

        emit Transfer(_from, _to, _value);
        // ↑ EMIT EVENT: Creates a permanent log on the blockchain
        // Wallets and apps listen for these to update their UI
    }
```

#### Approve Function — Authorization

```solidity
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Cannot approve zero address");
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
```

**Real-world analogy:** Like signing a check but not cashing it yet. You're saying "I authorize [spender] to take up to [value] from my account."

**Why is this needed?** The Exchange contract needs permission to move YOUR tokens when you deposit. Without approval, anyone could steal your tokens!

#### TransferFrom Function — Delegated Transfer

```solidity
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        // ↑ Two checks:
        // 1. Owner has enough tokens
        // 2. Caller has permission to spend this amount

        allowance[_from][msg.sender] -= _value;  // Reduce allowance
        _transfer(_from, _to, _value);            // Move the tokens
        return true;
    }
```

**Real-world analogy:** Like cashing the check you were given.

---

### 2.2 Exchange.sol — Decentralized Exchange

**Location:** `src/contracts/Exchange.sol` (210 lines)

**Purpose:** Allows users to trade ITM tokens for ETH without a centralized intermediary.

#### Exchange Function Reference Table

| Function | Line Numbers | Purpose |
|----------|-------------|---------|
| `feeAccount` (state) | Line 12 | Address that receives trading fees |
| `feePercent` (state) | Line 15 | Fee percentage (e.g., 10%) |
| `ETHER` constant | Line 19 | `address(0)` to represent ETH |
| `tokens` mapping | Line 23 | Balances: `tokens[token][user]` |
| `orders` mapping | Line 26 | Stores all orders by ID |
| `orderCount` | Line 29 | Counter for unique order IDs |
| `orderCancelled` | Line 32 | Tracks cancelled orders |
| `orderFilled` | Line 35 | Tracks filled orders |
| `Deposit` event | Line 38 | Emitted on deposits |
| `Withdraw` event | Line 39 | Emitted on withdrawals |
| `Order` event | Lines 40-48 | Emitted when order created |
| `Cancel` event | Lines 49-57 | Emitted when order cancelled |
| `Trade` event | Lines 58-67 | Emitted when trade executes |
| `_Order` struct | Lines 70-78 | Order data structure |
| `constructor()` | Lines 83-86 | Sets feeAccount and feePercent |
| `receive()` fallback | Lines 90-92 | Rejects direct ETH transfers |
| `depositEther()` | Lines 96-99 | Deposit ETH to exchange |
| `withdrawEther()` | Lines 103-108 | Withdraw ETH from exchange |
| `depositToken()` | Lines 114-119 | Deposit tokens (requires approve first) |
| `withdrawToken()` | Lines 124-130 | Withdraw tokens from exchange |
| `balanceOf()` | Lines 133-135 | Check user's exchange balance |
| `makeOrder()` | Lines 142-159 | Create a new trade order |
| `cancelOrder()` | Lines 163-169 | Cancel your own order |
| `fillOrder()` | Lines 173-181 | Fill an existing order |
| `_trade()` (internal) | Lines 185-209 | Execute the trade and charge fees |

#### How a DEX Works

```
Traditional Exchange (Coinbase, Binance):
  User → [Centralized Company] → Other User
  - Company holds your funds
  - Company can freeze your account
  - Company can be hacked

Decentralized Exchange (Our Contract):
  User → [Smart Contract] ← Other User
  - Code holds funds (no company)
  - No one can freeze accounts
  - Code is transparent and auditable
```

#### State Variables Explained

```solidity
contract Exchange {
    address public feeAccount;
    // ↑ Address that receives trading fees (deployer)

    uint256 public feePercent;
    // ↑ Fee percentage (10 = 10%)

    address constant ETHER = address(0);
    // ↑ CONVENTION: We use address(0) to represent ETH
    // This lets us track ETH and tokens in the same mapping!

    mapping(address => mapping(address => uint256)) public tokens;
    // ↑ BALANCES ON EXCHANGE: tokens[tokenAddress][userAddress] = amount
    // For ETH:  tokens[address(0)][user] = ETH balance
    // For ITM:  tokens[tokenContract][user] = ITM balance

    mapping(uint256 => _Order) public orders;
    // ↑ All orders stored by ID

    uint256 public orderCount;
    // ↑ Counter for generating unique order IDs

    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;
    // ↑ Track order status (can't fill a cancelled order!)
```

#### Order Structure

```solidity
    struct _Order {
        uint256 id;           // Unique identifier
        address user;         // Who created the order
        address tokenGet;     // Token they WANT to receive
        uint256 amountGet;    // Amount they want
        address tokenGive;    // Token they WILL give
        uint256 amountGive;   // Amount they'll give
        uint256 timestamp;    // When order was created
    }
```

**Example Order:**
- User wants to BUY 100 ITM tokens
- User will PAY 0.1 ETH
- tokenGet = ITM address, amountGet = 100
- tokenGive = address(0) [ETH], amountGive = 0.1

#### The receive() Fallback Function (Lines 90-92)

```solidity
receive() external payable {
    revert("Use depositEther function");
}
```

**What this does:** Rejects any ETH sent directly to the contract address.

**Why this is critical:**

| Scenario | Without receive() | With our receive() |
|----------|------------------|-------------------|
| User sends ETH to contract address | ETH is accepted but NOT credited to user's balance | Transaction reverts, ETH returned |
| Result | ETH stuck forever (no way to withdraw) | User keeps their ETH, must use proper function |

**How Solidity 0.8.0 handles incoming ETH:**

```
Incoming ETH transfer
        │
        ▼
Does transaction have data (calling a function)?
        │
    ┌───┴───┐
   YES     NO
    │       │
    ▼       ▼
Call the    Is there a receive() function?
function         │
            ┌────┴────┐
           YES       NO
            │         │
            ▼         ▼
       Call receive() Is there a fallback() function?
                           │
                      ┌────┴────┐
                     YES       NO
                      │         │
                      ▼         ▼
                 Call fallback() Transaction reverts
```

**Why we force users to use `depositEther()`:**
1. `depositEther()` properly updates the `tokens` mapping
2. `depositEther()` emits a `Deposit` event for the frontend
3. Direct transfers would bypass our accounting system

#### Deposit Functions

```solidity
    function depositEther() public payable {
        // ↑ 'payable' means this function can receive ETH

        tokens[ETHER][msg.sender] += msg.value;
        // ↑ msg.value = amount of ETH sent with this transaction
        // Updates user's ETH balance on the exchange

        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }
```

```solidity
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER, "Cannot deposit ETH with this function");

        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        // ↑ IMPORTANT: User must call token.approve() FIRST!
        // This pulls tokens from user's wallet to the exchange contract

        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
```

**Two-Step Deposit Flow:**
```
Step 1: token.approve(exchangeAddress, amount)
        "I authorize the exchange to take my tokens"

Step 2: exchange.depositToken(tokenAddress, amount)
        "Exchange, please take the tokens I approved"
```

#### Withdraw Functions

```solidity
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "Insufficient ETH balance");

        tokens[ETHER][msg.sender] -= _amount;  // Update balance FIRST (security!)
        payable(msg.sender).transfer(_amount); // Then send ETH

        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }
```

**Security Pattern:** Checks-Effects-Interactions
1. **Check:** Verify user has enough balance
2. **Effect:** Update the balance
3. **Interact:** Send the ETH

This order prevents "re-entrancy attacks" where malicious contracts drain funds.

#### Make Order Function

```solidity
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        orderCount += 1;
        // ↑ Increment counter to get unique ID

        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }
```

#### Fill Order Function — The Trade

```solidity
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        require(!orderFilled[_id], "Order already filled");
        require(!orderCancelled[_id], "Order was cancelled");

        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;
    }
```

```solidity
    function _trade(
        uint256 _orderId,
        address _user,          // Order creator
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // FEE CALCULATION: 10% of what the filler gives
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        // EXECUTE THE TRADE:
        // 1. Filler gives tokenGet (+ fee) to order creator
        tokens[_tokenGet][msg.sender] -= (_amountGet + _feeAmount);
        tokens[_tokenGet][_user] += _amountGet;

        // 2. Fee goes to feeAccount
        tokens[_tokenGet][feeAccount] += _feeAmount;

        // 3. Order creator gives tokenGive to filler
        tokens[_tokenGive][_user] -= _amountGive;
        tokens[_tokenGive][msg.sender] += _amountGive;

        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, block.timestamp);
    }
```

**Trade Example:**
```
Alice creates order: "I want 100 ITM, I'll give 0.1 ETH"
Bob fills the order:
  - Bob gives 100 ITM + 10 ITM fee (110 total)
  - Alice receives 100 ITM
  - Fee account receives 10 ITM
  - Bob receives 0.1 ETH
```

---

### 2.3 Migrations.sol — Truffle Helper

**Location:** `src/contracts/Migrations.sol`

**Purpose:** Tracks which deployment scripts have run to prevent duplicates.

```solidity
contract Migrations {
    address public owner;
    uint256 public last_completed_migration;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    function setCompleted(uint256 completed) public restricted {
        last_completed_migration = completed;
    }
}
```

**Why it exists:** When you run `truffle migrate`, it checks this contract to know which migrations have already been deployed.

---

## 3. Migration Scripts

### 1_initial_migration.js

```javascript
const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
```

**What it does:** Deploys the Migrations contract first.

### 2_deploy_contracts.js

```javascript
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function(deployer) {
  const accounts = await web3.eth.getAccounts()

  // Deploy Token with 1,000,000 tokens
  const totalSupply = '1000000000000000000000000' // 1,000,000 * 10^18
  await deployer.deploy(Token, totalSupply);

  // Deploy Exchange with deployer as fee account, 10% fee
  const feeAccount = accounts[0]
  const feePercent = 10
  await deployer.deploy(Exchange, feeAccount, feePercent)
};
```

**Key points:**
- `artifacts.require()` loads the compiled contract
- `deployer.deploy()` sends the deployment transaction
- Constructor arguments are passed after the contract name

---

## 4. Frontend Application

### App.js — Main React Component

**Location:** `src/components/App.js` (428 lines)

#### Frontend Function Reference Table

| Function | Line Numbers | Purpose |
|----------|-------------|---------|
| `state` initialization | Lines 17-38 | Initial state with balances, orders, form inputs |
| `componentDidMount()` | Lines 41-43 | Calls loadBlockchainData on mount |
| `loadBlockchainData()` | Lines 46-102 | Connects to MetaMask, loads contracts |
| `loadBalances()` | Lines 105-125 | Fetches wallet & exchange balances |
| `loadOrders()` | Lines 128-152 | Loads all orders from contract |
| `depositEth()` | Lines 155-162 | Calls `exchange.depositEther()` |
| `withdrawEth()` | Lines 165-172 | Calls `exchange.withdrawEther()` |
| `depositToken()` | Lines 175-184 | Calls `token.approve()` then `exchange.depositToken()` |
| `withdrawToken()` | Lines 187-194 | Calls `exchange.withdrawToken()` |
| `makeBuyOrder()` | Lines 197-206 | Calls `exchange.makeOrder()` for buy |
| `makeSellOrder()` | Lines 209-218 | Calls `exchange.makeOrder()` for sell |
| `fillOrder()` | Lines 221-226 | Calls `exchange.fillOrder()` |
| `cancelOrder()` | Lines 229-233 | Calls `exchange.cancelOrder()` |
| `formatPrice()` | Lines 236-254 | Calculates price from order data |
| `isBuyOrder()` | Lines 257-261 | Determines if order is buy or sell |
| `render()` | Lines 263-425 | JSX rendering all UI components |

#### UI Panel → Contract Function Mapping

| UI Section | Lines | Reads From | Writes To |
|------------|-------|-----------|-----------|
| **Balances Panel** | 287-300 | `web3.eth.getBalance()`, `token.balanceOf()`, `exchange.balanceOf()` | — |
| **Deposit/Withdraw Forms** | 302-323 | — | `exchange.depositEther()`, `exchange.withdrawEther()`, `token.approve()`, `exchange.depositToken()`, `exchange.withdrawToken()` |
| **Order Book** | 326-358 | `exchange.orders()`, `exchange.orderCancelled()`, `exchange.orderFilled()` | `exchange.fillOrder()` |
| **New Order Forms** | 361-378 | — | `exchange.makeOrder()` |
| **My Orders** | 380-398 | `exchange.orders()` (filtered by account) | `exchange.cancelOrder()` |
| **Trade History** | 401-419 | `exchange.orderFilled()` mapped orders | — |

#### Web3 Initialization (Lines 46-102)

```javascript
async loadBlockchainData() {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Create Web3 instance
  const web3 = new Web3(window.ethereum);
```

**What's happening:**
1. `window.ethereum` is injected by MetaMask
2. `eth_requestAccounts` prompts user to connect wallet
3. `Web3` library creates a bridge to the blockchain

#### Loading Contracts

```javascript
  // Get network ID
  const networkId = await web3.eth.net.getId();

  // Load Token contract
  const tokenData = Token.networks[networkId];
  const token = new web3.eth.Contract(Token.abi, tokenData.address);
```

**ABI (Application Binary Interface):**
- JSON describing all functions and events
- Tells Web3 HOW to call the contract
- Auto-generated by `truffle compile`

#### Reading vs Writing

```javascript
// READING (free, no gas)
const balance = await token.methods.balanceOf(account).call();
// ↑ .call() = read-only, doesn't modify blockchain

// WRITING (costs gas)
await exchange.methods.depositEther().send({ from: account, value: amount });
// ↑ .send() = modifies blockchain, requires gas
```

---

### 4.2 State Management (React State)

This application uses **React class component state** (not Redux). All state is managed in `App.js`.

#### State Shape (Lines 17-38)

```javascript
state = {
  // Connection state
  account: '',              // Current MetaMask account address
  web3: null,               // Web3 instance
  token: null,              // Token contract instance
  exchange: null,           // Exchange contract instance
  loading: true,            // Loading indicator

  // Balances
  ethBalance: '0',          // Wallet ETH balance
  tokenBalance: '0',        // Wallet ITM balance
  exchangeEthBalance: '0',  // Exchange ETH balance
  exchangeTokenBalance: '0', // Exchange ITM balance

  // Orders
  orders: [],               // Open orders (not cancelled, not filled)
  cancelledOrders: [],      // Cancelled orders
  filledOrders: [],         // Filled orders (trade history)

  // Form inputs
  depositEthAmount: '',
  withdrawEthAmount: '',
  depositTokenAmount: '',
  withdrawTokenAmount: '',
  buyAmount: '',
  buyPrice: '',
  sellAmount: '',
  sellPrice: ''
}
```

#### State Update Flow

| User Action | Function Called | State Updates |
|-------------|-----------------|---------------|
| Page loads | `componentDidMount()` → `loadBlockchainData()` | Sets `web3`, `token`, `exchange`, `account`, then calls `loadBalances()` and `loadOrders()` |
| Deposits ETH | `depositEth()` | Clears `depositEthAmount`, then calls `loadBalances()` |
| Withdraws ETH | `withdrawEth()` | Clears `withdrawEthAmount`, then calls `loadBalances()` |
| Deposits ITM | `depositToken()` | Clears `depositTokenAmount`, then calls `loadBalances()` |
| Withdraws ITM | `withdrawToken()` | Clears `withdrawTokenAmount`, then calls `loadBalances()` |
| Creates buy order | `makeBuyOrder()` | Clears `buyAmount`, `buyPrice`, then calls `loadOrders()` |
| Creates sell order | `makeSellOrder()` | Clears `sellAmount`, `sellPrice`, then calls `loadOrders()` |
| Fills order | `fillOrder()` | Calls `loadOrders()` and `loadBalances()` |
| Cancels order | `cancelOrder()` | Calls `loadOrders()` |
| MetaMask account change | `window.ethereum.on('accountsChanged')` | Sets new `account`, calls `loadBalances()` |

#### Order Filtering Logic (Lines 128-152)

```javascript
// How orders are categorized:
for (let i = 1; i <= orderCount; i++) {
  const order = await exchange.methods.orders(i).call();
  const isCancelled = await exchange.methods.orderCancelled(i).call();
  const isFilled = await exchange.methods.orderFilled(i).call();

  if (isCancelled) {
    cancelledOrders.push(order);      // User cancelled this order
  } else if (isFilled) {
    filledOrders.push(order);         // Someone filled this order (trade history)
  } else {
    orders.push(order);               // Still open for trading
  }
}
```

**Key insight:** Open orders = All orders - Cancelled orders - Filled orders

---

### 4.3 App.css — Styling Documentation

**Location:** `src/components/App.css` (219 lines)

#### Color Scheme (Dark Theme)

| CSS Variable | Hex Code | Usage |
|-------------|----------|-------|
| Main background | `#1a1a2e` | Body, content area |
| Card background | `#16213e` | Cards, panels |
| Header/accent | `#0f3460` | Navbar, card headers |
| Primary accent | `#e94560` | Brand name, highlights |
| Text color | `#eee` | All text |
| Success (buy) | `#28a745` | Buy orders, green text |
| Danger (sell) | `#e94560` | Sell orders, red text |

#### Layout Structure (Lines 39-63)

```css
.content {
  display: flex;              /* Horizontal layout */
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-evenly;
}

.content > div {
  width: 25%;                 /* 4 equal columns */
}
```

**The 4 panels:**
1. Balances + Deposit/Withdraw (left)
2. Order Book (center-left)
3. New Order + My Orders (center-right)
4. Trade History (right)

#### Why Balance Values May Appear Invisible

**Problem:** If custom CSS overrides text color, values can be dark on dark.

**Solution in our CSS (Lines 89-106):**
```css
.table {
  color: #eee;                /* White text for all table cells */
}

.table td {
  color: inherit;             /* Inherits #eee from parent */
}
```

#### Bootstrap 4 Classes Used

| Class | Purpose |
|-------|---------|
| `navbar`, `navbar-dark` | Navigation bar styling |
| `card`, `card-header`, `card-body` | Panel structure |
| `table`, `table-sm` | Data tables |
| `btn`, `btn-primary`, `btn-success`, `btn-danger` | Buttons |
| `form-control`, `form-control-sm` | Input fields |
| `text-success`, `text-danger` | Color utility classes |

#### Responsive Design (Lines 198-218)

```css
@media (max-width: 992px) {
  .content {
    display: block;           /* Stack panels vertically on mobile */
  }
  .content > div {
    width: 100% !important;   /* Full width on mobile */
  }
}
```

---

## 5. Configuration Files

### truffle-config.js

```javascript
module.exports = {
  networks: {
    // LOCAL TESTING
    development: {
      host: "127.0.0.1",
      port: 7545,           // Ganache default port
      network_id: "*"       // Match any network
    },

    // SEPOLIA TESTNET
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: { phrase: mnemonic },
        providerOrUrl: alchemyUrl,
        pollingInterval: 15000
      }),
      network_id: 11155111,  // Sepolia's chain ID
      gas: 5500000,          // Gas limit
      confirmations: 2,      // Wait for 2 confirmations
      timeoutBlocks: 200,    // Timeout after 200 blocks
      skipDryRun: true       // Skip simulation
    }
  },

  compilers: {
    solc: {
      version: "0.8.0"       // Must match pragma in contracts!
    }
  }
}
```

**HDWalletProvider:**
- Derives Ethereum accounts from your 12-word mnemonic
- Signs transactions before sending to the network
- Uses Alchemy/Infura as the connection to Ethereum

### .env (Environment Variables)

**Location:** `.env` (root folder, gitignored)

```bash
# Your MetaMask wallet seed phrase (12 words)
MNEMONIC="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"

# Alchemy API endpoint for Sepolia
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Infura API key (alternative to Alchemy)
INFURA_KEY=your-infura-project-id
```

#### Getting an Alchemy API Key

1. Go to https://www.alchemy.com/
2. Create a free account
3. Click "Create App"
4. Select:
   - Chain: Ethereum
   - Network: Sepolia
5. Copy the HTTPS URL from your app dashboard
6. Paste into `.env` as `ALCHEMY_SEPOLIA_URL`

#### Finding Your MetaMask Mnemonic

1. Open MetaMask extension
2. Click account icon → Settings
3. Security & Privacy → Reveal Secret Recovery Phrase
4. Enter your password
5. Copy the 12 words (NEVER share these!)

#### Security Warnings

| Risk | Consequence |
|------|-------------|
| Committing `.env` to GitHub | Anyone can steal your funds |
| Sharing mnemonic | Complete wallet access lost |
| Using mainnet mnemonic | Real money at risk |

**ALWAYS use a dedicated test wallet with test ETH only!**

---

### .gitignore

**Location:** `.gitignore` (root folder)

```bash
# Dependencies - can be reinstalled with npm install
node_modules/

# Environment - contains secrets
.env
.env.local
.env.development.local

# Build artifacts - can be regenerated
/build

# OS files - system-specific
.DS_Store
Thumbs.db

# IDE settings - personal preference
.vscode/
.idea/

# Truffle secrets
.secret

# Claude AI files - not needed in repo
CLAUDE.md
.claude/
```

#### Why Each Entry is Ignored

| Entry | Reason |
|-------|--------|
| `node_modules/` | 500MB+ of dependencies, reinstall with `npm install` |
| `.env` | Contains private keys and API secrets |
| `build/` | Generated by `npm run build`, regeneratable |
| `.DS_Store` | macOS system files, not relevant to code |
| `.vscode/` | IDE settings vary per developer |
| `CLAUDE.md`, `.claude/` | AI assistant files, not part of project |

---

### .env.example

**Location:** `.env.example` (root folder, committed to repo)

```bash
# Copy this file to .env and fill in your values:
# cp .env.example .env

MNEMONIC="your twelve word seed phrase here"
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
INFURA_KEY=YOUR_INFURA_PROJECT_ID
```

**Purpose:** Shows other developers what environment variables are required without exposing real values.

**Usage:**
```bash
# New developer setup
cp .env.example .env
# Then edit .env with your actual values
```

---

## 6. Test Files

### 6.1 Test File Overview

| Test File | Lines | What It Tests |
|-----------|-------|--------------|
| `test/Token.test.js` | 174 lines | ERC-20 token functionality |
| `test/Exchange.test.js` | 430 lines | DEX operations and trading |
| `test/helpers.js` | 12 lines | Utility functions for tests |

### 6.2 Running Tests

```bash
# Prerequisites: Ganache running on port 7545

# Run all tests
npx truffle test

# Run specific test file
npx truffle test test/Token.test.js
npx truffle test test/Exchange.test.js
```

**Expected Output:**
```
  Contract: Token
    deployment
      ✓ tracks the name
      ✓ tracks the symbol
      ✓ tracks the decimals
      ✓ tracks the total supply
      ✓ assigns the total supply to the deployer
    sending tokens
      success
        ✓ transfers token balances
        ✓ emits a Transfer event
      failure
        ✓ rejects insufficient balances
        ✓ rejects invalid recipients
    ...

  30 passing (8s)
```

### 6.3 Test Helpers (test/helpers.js)

```javascript
// test/helpers.js - Utility functions
export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const EVM_REVERT = 'VM Exception while processing transaction: revert'

// Convert number to wei (18 decimals)
export const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'))
}

// tokens() is same as ether() - both use 18 decimals
export const tokens = (n) => ether(n)
```

### 6.4 Test Structure Pattern

```javascript
const Token = artifacts.require('./Token')

contract('Token', ([deployer, receiver, exchange]) => {
  // ↑ contract() is like describe() but provides test accounts
  // accounts[0] = deployer, accounts[1] = receiver, accounts[2] = exchange

  let token  // Variable to hold deployed contract

  beforeEach(async () => {
    // Fresh contract for each test (isolation)
    token = await Token.new(tokens(1000000))
  })

  describe('deployment', () => {
    it('tracks the name', async () => {
      const result = await token.name()
      result.should.equal('ITM Coin')
    })
  })
})
```

### 6.5 Token.test.js Test Cases (174 lines)

| Test Suite | What It Validates |
|------------|------------------|
| **deployment** | Name, symbol, decimals, totalSupply, initial balance |
| **sending tokens** | transfer() success and failure cases |
| **approving tokens** | approve() and allowance tracking |
| **delegated transfers** | transferFrom() with approval |

### 6.6 Exchange.test.js Test Cases (430 lines)

| Test Suite | What It Validates |
|------------|------------------|
| **deployment** | feeAccount and feePercent |
| **fallback** | Rejects direct ETH sends |
| **depositing Ether** | depositEther() and balance tracking |
| **withdrawing Ether** | withdrawEther() success and failure |
| **depositing tokens** | approve + depositToken flow |
| **withdrawing tokens** | withdrawToken() success and failure |
| **checking balances** | balanceOf() returns correct values |
| **making orders** | makeOrder() creates order struct |
| **order actions** | fillOrder() and cancelOrder() |
| **fillOrder()** | Balance changes after trade execution |

### 6.7 Testing Events

```javascript
// Exchange.test.js line 59-67
it('emits a Deposit event', () => {
  const log = result.logs[0]
  log.event.should.eq('Deposit')
  const event = log.args
  event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
  event.user.should.equal(user1, 'user address is correct')
  event.amount.toString().should.equal(amount.toString(), 'amount is correct')
  event.balance.toString().should.equal(amount.toString(), 'balance is correct')
})
```

### 6.8 Testing Failures (Reverts)

```javascript
// Token.test.js lines 77-85
it('rejects insufficient balances', async () => {
  let invalidAmount
  invalidAmount = tokens(100000000) // 100 million - greater than total supply
  await token.transfer(receiver, invalidAmount, { from: deployer })
    .should.be.rejectedWith(EVM_REVERT)
})
```

### 6.9 Testing Fee Calculation

```javascript
// Exchange.test.js lines 264-277
it('executes the trade & charges fees', async () => {
  let balance
  balance = await exchange.balanceOf(token.address, user1)
  balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')

  balance = await exchange.balanceOf(token.address, user2)
  balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted with fee applied')

  const feeAccount = await exchange.feeAccount()
  balance = await exchange.balanceOf(token.address, feeAccount)
  balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
})
```

---

## 7. Utility Scripts

### seed-exchange.js

**Location:** `scripts/seed-exchange.js` (140 lines)

**Purpose:** Populates the exchange with sample data to simulate a real trading environment. Only for local Ganache testing.

#### Why This Script Exists

When you deploy to a fresh blockchain (Ganache), the exchange is empty:
- No tokens deposited
- No orders in the order book
- No trade history

This script creates a realistic demo environment with actual orders and trades.

#### Accounts Used

| Account | Variable | Role |
|---------|----------|------|
| `accounts[0]` | `user1` | Token deployer, has all 1M tokens initially, deposits ETH |
| `accounts[1]` | `user2` | Receives 10,000 tokens, deposits tokens |

#### Step-by-Step Execution

**Phase 1: Setup (Lines 32-56)**
```javascript
// 1. Transfer 10,000 ITM from deployer to user2
await token.transfer(receiver, web3.utils.toWei('10000', 'ether'), { from: sender })

// 2. User1 deposits 1 ETH to exchange
await exchange.depositEther({ from: user1, value: ether(1) })

// 3. User2 approves and deposits 10,000 ITM to exchange
await token.approve(exchange.address, tokens(10000), { from: user2 })
await exchange.depositToken(token.address, tokens(10000), { from: user2 })
```

**Phase 2: Create a Cancelled Order (Lines 58-71)**
```javascript
// User1 creates order: "I want 100 ITM, I'll give 0.1 ETH"
result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })

// User1 cancels the order (to show cancelled orders in UI)
orderId = result.logs[0].args.id
await exchange.cancelOrder(orderId, { from: user1 })
```

**Phase 3: Create Filled Orders — Trade History (Lines 73-111)**

| Order | User1 Wants | User1 Gives | Filled By |
|-------|-------------|-------------|-----------|
| 1 | 100 ITM | 0.1 ETH | User2 |
| 2 | 50 ITM | 0.01 ETH | User2 |
| 3 | 200 ITM | 0.15 ETH | User2 |

These appear in the Trade History panel.

**Phase 4: Create Open Orders — Order Book (Lines 113-131)**

**User1's Buy Orders (wants ITM, gives ETH):**
| Order | Amount | Price (ETH/ITM) |
|-------|--------|-----------------|
| 1-10 | 10, 20, 30...100 ITM | 0.01 ETH each |

**User2's Sell Orders (wants ETH, gives ITM):**
| Order | Amount | Price (ETH/ITM) |
|-------|--------|-----------------|
| 1-10 | 10, 20, 30...100 ITM | 0.01 ETH each |

#### Wait Function (Lines 14-17)

```javascript
const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
```

**Why:** Creates 1-second delays between orders so they have different timestamps. This makes the order book and trade history look more realistic.

#### Running the Script

```bash
# Prerequisites: Ganache running, contracts deployed

# Run the seed script
npx truffle exec scripts/seed-exchange.js

# Expected output:
# Token fetched 0x...
# Exchange fetched 0x...
# Transferred 10000... tokens from 0x... to 0x...
# Deposited 1 Ether from 0x...
# Approved 10000 tokens from 0x...
# Deposited 10000 tokens from 0x...
# Made order from 0x...
# Cancelled order from 0x...
# ... (more orders)
```

#### Why Only for Local Ganache

| Network | Problem with Seeding |
|---------|---------------------|
| Ganache (local) | Free, unlimited accounts, fast transactions |
| Sepolia (testnet) | Requires real test ETH for gas, slow, costs money |
| Mainnet | Would cost real money! |

On testnets/mainnet, you would manually create orders through the UI.

---

## 8. Deployment Guide

### Local Deployment (Ganache)

```bash
# 1. Start Ganache
ganache-cli -p 7545

# 2. Compile contracts
npx truffle compile

# 3. Deploy
npx truffle migrate --reset

# 4. Seed data
npx truffle exec scripts/seed-exchange.js

# 5. Start frontend
npm run start
```

### Sepolia Testnet Deployment

```bash
# 1. Create .env file with MNEMONIC and ALCHEMY_SEPOLIA_URL

# 2. Get test ETH from faucet
# https://sepoliafaucet.com

# 3. Deploy
npx truffle migrate --network sepolia --reset

# 4. Note the contract addresses from output!

# 5. Start frontend
npm run start
```

---

## 9. Security Analysis

### 9.1 Security Patterns Used in This Project

#### Checks-Effects-Interactions Pattern (Exchange.sol, Lines 103-108)

This pattern prevents re-entrancy attacks:

```solidity
// Exchange.sol lines 103-108
function withdrawEther(uint256 _amount) public {
    require(tokens[ETHER][msg.sender] >= _amount, "Insufficient ETH balance");  // CHECK
    tokens[ETHER][msg.sender] -= _amount;                                         // EFFECT
    payable(msg.sender).transfer(_amount);                                        // INTERACTION
    emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
}
```

**Why this order matters:**
1. **CHECK:** Verify the user has enough balance
2. **EFFECT:** Update the balance BEFORE sending funds
3. **INTERACT:** Send the funds to the user

If we sent funds first (interaction), a malicious contract could call back into `withdrawEther` repeatedly before the balance was reduced!

#### Overflow/Underflow Protection (Solidity 0.8.0+)

```solidity
// Token.sol lines 47-48 — built-in protection!
balanceOf[_from] -= _value;   // Will revert if _value > balanceOf[_from]
balanceOf[_to] += _value;     // Will revert on overflow (impossible in practice)
```

**Why Solidity 0.8.0+ is safer:**
- Arithmetic operations automatically check for overflow/underflow
- No need for SafeMath library (required in older versions)
- Transactions revert instead of silently failing

#### Access Control (Exchange.sol, Lines 163-169)

```solidity
// Exchange.sol lines 163-169
function cancelOrder(uint256 _id) public {
    _Order storage _order = orders[_id];
    require(_order.user == msg.sender, "Not your order");  // Only order creator!
    require(_order.id == _id, "Order does not exist");     // Order must exist
    orderCancelled[_id] = true;
    // ...
}
```

**Who can do what:**
| Action | Who Can Do It | Code Reference |
|--------|--------------|----------------|
| Cancel Order | Only order creator | Exchange.sol:165 |
| Fill Order | Anyone | Exchange.sol:173-181 |
| Withdraw Funds | Only fund owner | Exchange.sol:104 |
| Make Order | Anyone with exchange balance | Exchange.sol:142-159 |

### 9.2 Why approve + transferFrom is Safer

```
UNSAFE APPROACH (NOT USED):
  User sends tokens directly to Exchange
  → What if Exchange never credits them?
  → No way to cancel mid-transaction

SAFE APPROACH (OUR PATTERN):
  Step 1: User approves Exchange (Token.sol:55-60)
  Step 2: Exchange pulls tokens (via Token.sol:67-73)
  → User stays in control until deposit completes
  → Can approve and deposit in separate transactions
```

### 9.3 Common Vulnerabilities (NOT present in this code)

| Vulnerability | Description | Our Protection |
|--------------|-------------|----------------|
| **Re-entrancy** | Attacker calls back during withdrawal | Checks-Effects-Interactions pattern |
| **Integer Overflow** | Numbers wrap around | Solidity 0.8.0 built-in checks |
| **Front-running** | Miners see your transaction first | *Risk exists* — see below |
| **Unchecked Return Values** | Ignoring failed transfers | `require(Token.transfer(...))` |

### 9.4 Front-Running Risk in DEX Order Books

**The Problem:** When you submit a transaction to fill an order:
1. Your transaction enters the "mempool" (waiting area)
2. Miners/validators can see it before it's confirmed
3. They could submit their own transaction with higher gas to fill the order first

**Mitigation strategies (advanced):**
- Use commit-reveal schemes
- Set slippage tolerance
- Use private transaction pools (e.g., Flashbots)

*Note: This project uses a simple order book model for teaching purposes.*

### 9.5 Reference: SWC Registry

The Smart Contract Weakness Classification (SWC) registry catalogs known vulnerabilities:
- [SWC-107: Re-entrancy](https://swcregistry.io/docs/SWC-107)
- [SWC-101: Integer Overflow](https://swcregistry.io/docs/SWC-101)
- [SWC-104: Unchecked Return Values](https://swcregistry.io/docs/SWC-104)

---

## 10. Troubleshooting Guide

### 10.1 Node.js OpenSSL Error

**Error:**
```
error:0308010C:digital envelope routines::unsupported
```

**Cause:** Node.js 18+ uses OpenSSL 3.0, which removed some legacy algorithms that older webpack versions require.

**Solution:**
```bash
# Before running npm commands, set this environment variable:
export NODE_OPTIONS=--openssl-legacy-provider

# On Windows:
set NODE_OPTIONS=--openssl-legacy-provider

# Then run:
npm run start
```

### 10.2 "Token contract not deployed to this network!"

**Error in browser console:**
```
Token contract not deployed to this network!
```

**Cause:** MetaMask is connected to a different network than where your contracts are deployed.

**Solution:**
1. Open MetaMask
2. Click the network dropdown at the top
3. Select "Sepolia test network"
4. If not visible: Settings → Advanced → Show test networks → ON
5. Refresh the page

### 10.3 "window.web3 API removed" Warning

**Warning:**
```
MetaMask no longer injects window.web3
```

**Cause:** MetaMask deprecated `window.web3` injection in late 2020.

**Our Solution (App.js lines 54-58):**
```javascript
// We create our own Web3 instance using window.ethereum
await window.ethereum.request({ method: 'eth_requestAccounts' });
const web3 = new Web3(window.ethereum);
```

### 10.4 MetaMask Console Pasting Blocked

**Issue:** When trying to paste in browser console, MetaMask shows "type 'allow pasting' to enable"

**Cause:** Chrome security feature to prevent pasting malicious code.

**Solution:** Type `allow pasting` in the console first, then paste your code.

### 10.5 Balance Values Invisible (CSS Issue)

**Issue:** Balance numbers appear but are hard to read (dark text on dark background).

**Solution:** The App.css file uses proper contrast colors. If issue persists:
```css
/* Check src/components/App.css for proper text colors */
.table td {
  color: #ffffff !important;
}
```

### 10.6 EACCES Permission Denied (Truffle Compiler)

**Error:**
```
EACCES: permission denied, open '/Users/.../truffle-nodejs/compilers/...'
```

**Cause:** Truffle compiler cache has permission issues.

**Solution:**
```bash
# Fix permissions on the cache directory
sudo chown -R $(whoami) ~/Library/Preferences/truffle-nodejs/

# Or delete the cache and let it rebuild
rm -rf ~/Library/Preferences/truffle-nodejs/compilers/
```

### 10.7 PollingBlockTracker Error

**Error:**
```
PollingBlockTracker - encountered an error while attempting to update latest block
```

**Cause:** Network connection issues with the RPC provider.

**Solution (truffle-config.js):**
```javascript
sepolia: {
  provider: () => new HDWalletProvider({
    mnemonic: { phrase: mnemonic },
    providerOrUrl: alchemyUrl,
    pollingInterval: 15000,         // Add this
    networkCheckTimeout: 100000     // Add this
  }),
  // ...
}
```

### 10.8 "Insufficient funds for gas" Error

**Cause:** Your MetaMask wallet doesn't have enough ETH to pay for gas.

**Solution:**
1. Go to a Sepolia faucet: https://sepoliafaucet.com
2. Enter your wallet address
3. Request test ETH (0.5 ETH is usually enough)
4. Wait for the transaction to confirm (check Etherscan)

---

## 11. Etherscan Verification Guide

### 11.1 Viewing Deployed Contracts

Our contracts are deployed on Sepolia testnet:

| Contract | Etherscan Link |
|----------|---------------|
| Token | https://sepolia.etherscan.io/address/0xC696c71FA5FCe603BfD8A454DB1288D05E844E26 |
| Exchange | https://sepolia.etherscan.io/address/0xED05EB3D26b8C87aC55F6c7d6e7527d41295f5b7 |

### 11.2 Reading Contract State on Etherscan

1. Go to the contract address on Etherscan
2. Click the "Contract" tab
3. Click "Read Contract"
4. You can query any public variable:
   - `name()` → "ITM Coin"
   - `symbol()` → "ITM"
   - `totalSupply()` → 1000000000000000000000000 (in wei)
   - `balanceOf(address)` → Enter any address to check balance

### 11.3 Verifying Contract Source Code

**Step 1: Flatten your contract**
```bash
npx truffle-flattener src/contracts/Token.sol > TokenFlat.sol
```

**Step 2: On Etherscan:**
1. Go to Contract → Verify and Publish
2. Select "Solidity (Single file)"
3. Compiler Version: v0.8.0
4. Optimization: Enabled, 200 runs
5. Paste the flattened source code
6. Click "Verify and Publish"

### 11.4 Tracing Transactions

1. Find a transaction hash (from MetaMask or the app)
2. Go to: `https://sepolia.etherscan.io/tx/YOUR_TX_HASH`
3. View:
   - **Status:** Success or Failed
   - **Block:** Which block included this transaction
   - **From/To:** Sender and receiver
   - **Value:** ETH transferred
   - **Gas Used:** Computational cost
   - **Input Data:** Function called and parameters

### 11.5 Viewing Events/Logs

1. Go to the contract on Etherscan
2. Click "Events" tab
3. See all emitted events:
   - `Transfer` events for token movements
   - `Deposit`/`Withdraw` events
   - `Order`/`Cancel`/`Trade` events

---

## 12. Flow Diagrams

### 12.1 Complete System Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           USER'S BROWSER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         React Application                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Balances │  │  Order   │  │   New    │  │  Trade   │           │  │
│  │  │  Panel   │  │   Book   │  │  Order   │  │ History  │           │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │  │
│  │       │              │              │              │                │  │
│  │       └──────────────┴──────────────┴──────────────┘                │  │
│  │                              │                                       │  │
│  │                        src/components/App.js                        │  │
│  └──────────────────────────────┼──────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────┼──────────────────────────────────────┐  │
│  │                         Web3.js Library                              │  │
│  │                    (JavaScript ↔ Ethereum Bridge)                   │  │
│  └──────────────────────────────┼──────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────┼──────────────────────────────────────┐  │
│  │                      MetaMask Extension                              │  │
│  │              (Wallet + Transaction Signing + Network)               │  │
│  └──────────────────────────────┼──────────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │
                                  │ JSON-RPC over HTTPS
                                  │ (via Alchemy/Infura)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ETHEREUM BLOCKCHAIN (Sepolia)                         │
│                                                                              │
│  ┌──────────────────────────┐       ┌──────────────────────────┐           │
│  │      Token.sol           │       │      Exchange.sol         │           │
│  │  (ERC-20: ITM Coin)      │◀─────▶│  (DEX Trading Logic)      │           │
│  │                          │       │                           │           │
│  │  • balanceOf mapping     │       │  • tokens mapping         │           │
│  │  • allowance mapping     │       │  • orders mapping         │           │
│  │  • transfer()            │       │  • makeOrder()            │           │
│  │  • approve()             │       │  • fillOrder()            │           │
│  │  • transferFrom()        │       │  • cancelOrder()          │           │
│  └──────────────────────────┘       └──────────────────────────┘           │
│                                                                              │
│  Contract Addresses:                                                         │
│  Token:    0xC696c71FA5FCe603BfD8A454DB1288D05E844E26                       │
│  Exchange: 0xED05EB3D26b8C87aC55F6c7d6e7527d41295f5b7                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Trade Execution Flow (with Balance Changes)

```
SCENARIO: Alice wants to BUY 100 ITM for 0.1 ETH
          Bob will SELL 100 ITM and receive 0.1 ETH
          Exchange charges 10% fee to Bob (the filler)

BEFORE TRADE:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Alice       │  │      Bob        │  │   Fee Account   │
│ ETH: 0.1        │  │ ITM: 110        │  │ ITM: 0          │
│ ITM: 0          │  │ ETH: 0          │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

STEP 1: Alice creates order
        makeOrder(ITM, 100, ETH, 0.1)
        "I want 100 ITM, I'll give 0.1 ETH"

STEP 2: Bob fills the order
        fillOrder(orderId)

        _trade() executes:
        ┌────────────────────────────────────────────────────────────┐
        │ 1. Fee = 100 ITM × 10% = 10 ITM                            │
        │ 2. Bob gives: 100 + 10 = 110 ITM total                     │
        │ 3. Alice receives: 100 ITM                                  │
        │ 4. Fee account receives: 10 ITM                            │
        │ 5. Alice gives: 0.1 ETH                                    │
        │ 6. Bob receives: 0.1 ETH                                   │
        └────────────────────────────────────────────────────────────┘

AFTER TRADE:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Alice       │  │      Bob        │  │   Fee Account   │
│ ETH: 0          │  │ ITM: 0          │  │ ITM: 10         │
│ ITM: 100        │  │ ETH: 0.1        │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 12.3 Token Transfer Flow

```
┌──────────┐    transfer(to, amount)    ┌──────────┐
│  Sender  │ ─────────────────────────▶ │ Receiver │
└──────────┘                            └──────────┘
     │                                        │
     │ balanceOf[sender] -= amount            │
     │                                        │
     │             emit Transfer              │ balanceOf[receiver] += amount
     └────────────────────────────────────────┘
```

### 12.4 Deposit Token Flow (Two-Step)

```
┌──────────┐                  ┌─────────────┐                  ┌──────────┐
│   User   │                  │    Token    │                  │ Exchange │
└────┬─────┘                  └──────┬──────┘                  └────┬─────┘
     │                               │                              │
     │ 1. approve(exchange, amount)  │                              │
     │──────────────────────────────▶│                              │
     │                               │                              │
     │     allowance[user][exchange] = amount                       │
     │                               │                              │
     │ 2. depositToken(token, amount)│                              │
     │─────────────────────────────────────────────────────────────▶│
     │                               │                              │
     │                               │◀── transferFrom(user, this) ─│
     │                               │                              │
     │                      tokens[token][user] += amount           │
     │                               │                              │
```

### 12.5 Order Lifecycle

```
              makeOrder()
                  │
                  ▼
           ┌─────────────┐
           │   PENDING   │
           │             │
           │ orders[id]  │
           │ stored      │
           └─────────────┘
                  │
         ┌───────┴───────┐
         │               │
    cancelOrder()    fillOrder()
         │               │
         ▼               ▼
   ┌───────────┐   ┌───────────┐
   │ CANCELLED │   │  FILLED   │
   │           │   │           │
   │orderCancel│   │orderFilled│
   │led[id]=   │   │[id]=true  │
   │true       │   │           │
   └───────────┘   │_trade()   │
                   │executes   │
                   └───────────┘
```

### 12.6 Event-Driven Frontend Update Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React App)                          │
│                                                                  │
│  1. User clicks "Fill Order"                                    │
│     │                                                           │
│     ▼                                                           │
│  2. fillOrder() sends transaction to MetaMask                   │
│     │                                                           │
│     ▼                                                           │
│  3. MetaMask prompts user to confirm                            │
│     │                                                           │
│     ▼                                                           │
│  4. Transaction submitted to blockchain                         │
│     │                                                           │
└─────┼───────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN                                    │
│                                                                  │
│  5. Transaction mined, contract executes                        │
│     │                                                           │
│     ▼                                                           │
│  6. Trade event emitted with trade details                      │
│     │                                                           │
└─────┼───────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND                                      │
│                                                                  │
│  7. .send() promise resolves                                    │
│     │                                                           │
│     ▼                                                           │
│  8. loadOrders() and loadBalances() called                      │
│     │                                                           │
│     ▼                                                           │
│  9. UI re-renders with updated data                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.7 Contract Deployment Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│   npx truffle migrate --network sepolia --reset                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│   Migration 1: 1_initial_migration.js                           │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  Deploy Migrations.sol                                     │ │
│   │  → Tracks which migrations have run                        │ │
│   └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│   Migration 2: 2_deploy_contracts.js                            │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │  1. Deploy Token.sol                                       │ │
│   │     Constructor arg: totalSupply = 1,000,000 tokens        │ │
│   │     → All tokens minted to deployer                        │ │
│   │                                                            │ │
│   │  2. Deploy Exchange.sol                                    │ │
│   │     Constructor args: feeAccount, feePercent (10%)         │ │
│   │     → Exchange ready to accept deposits                    │ │
│   └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│   Artifacts updated: src/abis/Token.json, Exchange.json         │
│   → Contains deployed addresses for network ID 11155111         │
└─────────────────────────────────────────────────────────────────┘
```

### 12.8 File Dependency Graph

```
                    ┌─────────────────┐
                    │   package.json  │
                    │  (dependencies) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ truffle-config  │ │    src/        │ │     test/       │
│      .js        │ │                 │ │                 │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │         ┌─────────┴─────────┐         │
         │         │                   │         │
         │         ▼                   ▼         │
         │ ┌───────────────┐ ┌───────────────┐   │
         │ │  contracts/   │ │ components/   │   │
         │ │               │ │               │   │
         │ │ Token.sol     │ │  App.js       │   │
         │ │ Exchange.sol◀─│─│  (imports     │   │
         │ │ Migrations.sol│ │   ABIs)       │   │
         │ └───────┬───────┘ └───────┬───────┘   │
         │         │                 │           │
         │         ▼                 │           │
         │ ┌───────────────┐         │           │
         │ │    abis/      │◀────────┘           │
         │ │               │                     │
         │ │ Token.json    │                     │
         │ │ Exchange.json │                     │
         │ └───────────────┘                     │
         │                                       │
         └─────────────────┬─────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │   migrations/   │
                 │                 │
                 │ 1_initial_      │
                 │   migration.js  │
                 │ 2_deploy_       │
                 │   contracts.js  │
                 └─────────────────┘
```

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **ABI** | Application Binary Interface — JSON describing contract functions |
| **Address** | 42-character identifier (0x + 40 hex chars) for accounts/contracts |
| **Block** | A group of transactions added to the blockchain |
| **Contract** | A program deployed on the blockchain |
| **Decimals** | Number of decimal places (18 for most tokens) |
| **DEX** | Decentralized Exchange — trading without intermediaries |
| **ERC-20** | Ethereum Request for Comment 20 — token standard |
| **Gas** | Computational cost of transactions (paid in ETH) |
| **Mapping** | Solidity data structure (like a dictionary/hash table) |
| **MetaMask** | Browser wallet for Ethereum |
| **Mnemonic** | 12-word phrase that generates your private keys |
| **msg.sender** | The address calling the current function |
| **msg.value** | Amount of ETH sent with the transaction |
| **Payable** | Modifier allowing a function to receive ETH |
| **RPC** | Remote Procedure Call — API to interact with blockchain |
| **Sepolia** | Ethereum test network with free test ETH |
| **Smart Contract** | Self-executing code on the blockchain |
| **Solidity** | Programming language for Ethereum contracts |
| **Testnet** | Test blockchain network (not real money) |
| **Transaction** | A signed message changing blockchain state |
| **Web3.js** | JavaScript library to interact with Ethereum |
| **Wei** | Smallest unit of ETH (1 ETH = 10^18 wei) |

---

## Concept Mappings

| Blockchain Concept | Real-World Analogy |
|-------------------|-------------------|
| `mapping(address => uint)` | Bank ledger (account → balance) |
| `msg.sender` | Caller ID showing who's calling |
| `msg.value` | Cash attached to a letter |
| `require()` | Security guard checking ID |
| `event` | Receipt printed after purchase |
| `payable` | Mailbox that accepts packages |
| `approve + transferFrom` | Signing a check (authorize, then cash) |
| `constructor` | Factory setup (runs once) |
| `modifier` | Security checkpoint everyone must pass |
| Gas | Postage stamp (transaction fee) |
| Block confirmation | Check clearing at the bank |

---

## Additional Resources

- [Ethereum Official Documentation](https://ethereum.org/developers)
- [ERC-20 Token Standard (EIP-20)](https://eips.ethereum.org/EIPS/eip-20)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Truffle Documentation](https://trufflesuite.com/docs/)
- [MetaMask Developer Docs](https://docs.metamask.io/)

---

## Appendix: Converting to Word Document

To convert this training manual to a professional .docx file:

### Option 1: Using Pandoc (Recommended)

```bash
# Install Pandoc
brew install pandoc  # macOS
# or download from https://pandoc.org/

# Convert to Word with styling
pandoc TRAINING_DOCUMENTATION.md -o TRAINING_MANUAL.docx \
  --toc \
  --toc-depth=3 \
  --highlight-style=tango
```

### Option 2: Using VS Code

1. Install "Markdown All in One" extension
2. Open TRAINING_DOCUMENTATION.md
3. Press `Cmd/Ctrl + Shift + P`
4. Type "Print current document to HTML"
5. Open HTML in Word and save as .docx

### Option 3: Online Converters

- https://cloudconvert.com/md-to-docx
- https://www.markdowntopdf.com/

### Recommended Word Formatting

| Element | Style |
|---------|-------|
| Title | Heading 1, 18pt, Bold |
| Sections | Heading 2, 14pt |
| Code blocks | Courier New, 10pt, Light gray background |
| Tables | Borders, Header row shaded |
| Page numbers | Footer, centered |

---

**Document Version:** 2.0
**Last Updated:** February 2026
**Course:** ITM MBA Blockchain Developer Bootcamp
**Training Duration:** 30 hours
