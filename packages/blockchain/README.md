# @liquid/blockchain

A beginner-friendly Proof-of-Work (PoW) blockchain implementation in TypeScript.

## What is a Blockchain?

A blockchain is a chain of blocks where each block contains:

- **Data** (transactions)
- **Timestamp** (when it was created)
- **Hash** (unique fingerprint of the block)
- **Previous Hash** (link to the previous block)
- **Nonce** (number used for mining)

Think of it like a digital ledger that is:

1. **Immutable** - Once written, cannot be changed
2. **Decentralized** - No single authority controls it
3. **Transparent** - Everyone can see the history

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Blockchain Class                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Block   │  │  Block   │  │  Block   │  │ Pending  │     │
│  │    #0    │->│    #1    │->│    #2    │  │    Tx    │     │
│  │ (Genesis)│  │          │  │          │  │ (Mempool)│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│       ↑                                                      │
│       └──────────────────────────────────────────────────────┘
│                                                              │
│  Uses: Block (create/hash/mine) + Transaction (validate)    │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
packages/blockchain/
├── src/
│   ├── index.ts        # Main exports (entry point)
│   ├── blockchain.ts   # Blockchain class (manages the chain)
│   ├── block.ts        # Block functions (create, hash, mine, validate)
│   └── transaction.ts  # Transaction functions (create, validate, sign)
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Core Concepts

### 1. Block Structure

A block looks like this:

```typescript
{
  index: 0,                    // Block number (0 = genesis)
  timestamp: 1715731200000,    // Unix timestamp in milliseconds
  transactions: [...],          // List of transactions
  previousHash: "0",           // Hash of previous block
  hash: "0000abc123...",       // This block's hash
  nonce: 12345                 // Number changed during mining
}
```

### 2. Hashing

A hash is like a fingerprint - unique to the data.

```
Input: Block data (index + timestamp + transactions + previousHash + nonce)
       ↓
   SHA-256
       ↓
Output: "0000a3f7b2c8d9e1..." (64 characters, hexadecimal)
```

**Key property**: Change one character in input → completely different hash

### 3. Proof-of-Work (PoW) Mining

**Problem**: Find a hash that starts with a certain number of zeros.

**Example** (Difficulty = 4):

```
Valid hash must start with: "0000"

Try nonce = 0:   hash = "a3f7..." ❌ (no leading zeros)
Try nonce = 1:   hash = "8c2d..." ❌
Try nonce = 2:   hash = "b9e1..." ❌
...
Try nonce = 52341: hash = "0000f2a8..." ✅ Found it!
```

The miner keeps incrementing `nonce` until finding a valid hash.

**Why it's hard**: SHA-256 is unpredictable - you must try many nonces.
**Difficulty**: More zeros = harder to find = more computing power needed.

### 4. Chain Validation

To check if a blockchain is valid:

1. Genesis block has index 0 and previousHash = "0"
2. Each block's previousHash matches the previous block's hash
3. Each block's hash is correctly computed
4. Each block's hash satisfies the difficulty (PoW)
5. All transactions in each block are valid

If any check fails → chain is invalid!

### 5. Transactions

A transaction represents a transfer:

```typescript
{
  id: "uuid-123",           // Unique ID
  from: "Alice",            // Sender
  to: "Bob",                // Recipient
  amount: 50,               // Amount transferred
  timestamp: 1715731200000, // When created
  signature: "..."          // Optional: cryptographic proof
}
```

**Validation rules**:

- ID must be a non-empty string
- From/To must be non-empty strings
- Amount must be positive number
- Timestamp must be reasonable (not in future)
- Sender cannot be same as receiver

## Code Flow

### Creating a Blockchain

```typescript
// 1. Create blockchain (async factory method)
const blockchain = await Blockchain.create();

// What happens internally:
// a. Create config (difficulty=4, reward=100, blockTime=10000ms)
// b. Create genesis block (index=0, empty transactions)
// c. Mine genesis block (find nonce that gives hash starting with "0000")
// d. Add genesis block to chain
```

### Adding a Transaction

```typescript
// 2. Add transaction to mempool (pending transactions)
blockchain.addTransaction({
  id: "tx-1",
  from: "Alice",
  to: "Bob",
  amount: 50,
  timestamp: Date.now(),
});

// What happens:
// a. Validate transaction (check all rules)
// b. If valid, add to pendingTransactions array
// c. Transaction waits here until mined into a block
```

### Mining a Block

```typescript
// 3. Mine pending transactions into a block
const block = await blockchain.minePendingTransactions("miner-address");

// What happens:
// a. Create mining reward transaction (SYSTEM -> miner)
// b. Select pending transactions (up to max limit)
// c. Create new block with transactions
// d. Mine block (find nonce for valid hash)
// e. Validate the mined block
// f. Add block to chain
// g. Remove mined transactions from mempool
```

### Validating the Chain

```typescript
// 4. Check if blockchain is valid
const result = await blockchain.isChainValid();
// Returns: { isValid: true } OR { isValid: false, error: "...", invalidIndex: 5 }
```

## API Reference

### Blockchain Class

| Method                           | Description                              | Example                                                    |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `Blockchain.create(config?)`     | Create new blockchain with genesis block | `await Blockchain.create({ difficulty: 3 })`               |
| `getLatestBlock()`               | Get the most recent block                | `const latest = chain.getLatestBlock()`                    |
| `addTransaction(tx)`             | Add transaction to mempool               | `chain.addTransaction({ from: "A", to: "B", amount: 10 })` |
| `minePendingTransactions(miner)` | Mine block with pending txs              | `await chain.minePendingTransactions("miner1")`            |
| `isChainValid()`                 | Validate entire chain                    | `const valid = await chain.isChainValid()`                 |
| `setDifficulty(n)`               | Change mining difficulty                 | `chain.setDifficulty(5)`                                   |
| `setMaxTransactionsPerBlock(n)`  | Set tx limit per block                   | `chain.setMaxTransactionsPerBlock(20)`                     |

### Block Functions

| Function                                                | Description                    |
| ------------------------------------------------------- | ------------------------------ |
| `createBlock(index, txs, prevHash, nonce?, timestamp?)` | Create block structure         |
| `calculateBlockHash(block)`                             | Compute SHA-256 hash           |
| `mineBlock(candidate, difficulty)`                      | Find valid nonce               |
| `validateBlock(block, prevBlock, difficulty)`           | Verify block validity          |
| `createGenesisBlock(difficulty)`                        | Create and mine first block    |
| `isValidProofOfWork(hash, difficulty)`                  | Check if hash has enough zeros |

### Transaction Functions

| Function                              | Description                   |
| ------------------------------------- | ----------------------------- |
| `createTransaction(from, to, amount)` | Create new transaction        |
| `validateTransaction(tx)`             | Check if transaction is valid |
| `signTransaction(tx, privateKey)`     | Add signature to transaction  |

## Configuration Constants

```typescript
DEFAULT_DIFFICULTY = 4; // Starting difficulty (4 leading zeros)
DEFAULT_MINING_REWARD = 100; // Coins given to miner
DEFAULT_BLOCK_TIME = 10000; // Target time between blocks (ms)
MAX_TRANSACTIONS_PER_BLOCK = 10; // Max txs per block (excluding reward)
GENESIS_BLOCK_PREVIOUS_HASH = "0"; // Previous hash of genesis block
```

## Example Usage

```typescript
import { Blockchain } from "@liquid/blockchain";

async function main() {
  // Create blockchain
  const chain = await Blockchain.create({ difficulty: 3 });

  // Add transactions
  chain.addTransaction({
    id: crypto.randomUUID(),
    from: "Alice",
    to: "Bob",
    amount: 50,
    timestamp: Date.now(),
  });

  // Mine block
  const block = await chain.minePendingTransactions("miner-1");
  console.log(`Mined block #${block.index} with hash: ${block.hash}`);

  // Validate chain
  const valid = await chain.isChainValid();
  console.log(`Chain valid: ${valid.isValid}`);
}

main();
```

## Dependencies

- `@liquid/shared` - Shared types and constants
- Uses native Web Crypto API (SHA-256)
- No external crypto libraries needed

## How It Connects to Other Packages

```
┌─────────────────┐     uses      ┌─────────────────┐
│  @liquid/shared │<──────────────│ @liquid/blockchain│
│  (types/consts) │               │  (core logic)     │
└─────────────────┘               └────────┬────────┘
                                           │
                                           │ uses
                                           ↓
                                  ┌─────────────────┐
                                  │  @liquid/node-api│
                                  │  (HTTP server)   │
                                  └─────────────────┘
```

The `node-api` package creates a network of blockchain nodes and exposes HTTP endpoints to interact with them. The RL (Reinforcement Learning) agent can then control the blockchain parameters through these APIs.

## Learning Resources

1. **Blockchain basics**: Each block links to the previous via hash
2. **PoW concept**: Finding a hash with specific pattern requires work
3. **Immutability**: Changing any block breaks the chain validation
4. **Mining reward**: Miners get paid for securing the network
5. **Mempool**: Transactions wait here before being mined

## Testing Your Understanding

1. What happens if you change a transaction in an old block?
   - Answer: The block's hash changes, breaking the chain link

2. Why is PoW needed?
   - Answer: Makes it expensive to rewrite history (51% attack)

3. What does difficulty control?
   - Answer: How many leading zeros required in hash (higher = harder)

4. Where do pending transactions live?
   - Answer: In the mempool (pendingTransactions array)

5. Who gets the mining reward?
   - Answer: The miner who successfully mines the block
