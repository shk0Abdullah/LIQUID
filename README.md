# blockchain-rl

A Proof-of-Work blockchain with a gossip P2P network, REST API, simulation runner, web explorer, and reinforcement learning agents that learn to optimize chain parameters.

## Architecture

```
packages/shared        → shared types, interfaces, and constants
packages/blockchain    → core PoW chain logic (mining, validation, mempool)
packages/network       → gossip protocol P2P layer (TTL, fanout, dedup)
packages/node-api      → Bun HTTP server over multi-node network + RL endpoints
packages/simulation    → load generation and scenario runner
packages/rl-python     → Q-learning and DQN agents that call the API
apps/explorer          → Next.js blockchain explorer UI (port 3001)
```

## Monorepo

**Runtime / Package Manager**: Bun 1.3.9  
**Task Runner**: Turborepo

```bash
bun run dev          # start all packages in parallel
bun run build        # build all
bun run check-types  # TypeScript type-check all
bun run lint         # lint all
bun run format       # Prettier
```

## PoW + Validation

```
hash = SHA256(index || timestamp || previousHash || nonce || transactions)

Valid block if:
  1) index = prev.index + 1
  2) previousHash = prev.hash
  3) recomputedHash = stored hash
  4) hash starts with "0" * difficulty
  5) all transactions are valid
```

Uses the native Web Crypto API — no external crypto deps.

## Gossip Network

Each `NetworkNode` wraps a `Blockchain` and a `GossipProtocol`. Messages propagate via randomized fanout rather than full broadcast.

```
fanoutSize:  2 random neighbors per broadcast hop
maxNeighbors: 5 connections per node
TTL:          10 (decremented per hop)
deduplication via seen messageIds
```

Supports `broadcastWithSubsets()` for selective propagation and out-of-order block buffering.

## Node API Endpoints

```
GET  /health
GET  /network/nodes
GET  /network/state           → node count, chain heights, pending txs
GET  /network/topology        → neighbor graph
GET  /chain?nodeId=node-1
POST /network/nodes           → add a node
POST /network/reset           → reset network with N nodes
POST /network/discover        → trigger neighbor discovery
POST /transactions            → submit tx (gossips to all nodes)
POST /mine                    → mine a block on a specific node

POST /rl/reset                → reset state for RL training
POST /rl/step                 → apply action, return (state, reward, info)
```

### RL State & Reward

```
State:   { incoming_txs, mempool_size, current_tps, network_delay }
Action:  { difficulty (1–12), maxTxsPerBlock (1–500),
           gossipFanout (0–1), mineIntervalMs (100–10000) }
Reward:  TPS − (invalid_msg_rate + dropped_msg_rate + timeout_rate)
```

## RL Agents

### Q-Learning (tabular)

File: `packages/rl-python/train_q_learning.py`

- Discrete 3×3×3 state space (mempool × TPS × delay buckets)
- 3 predefined action configs
- 420 episodes × 210 steps, `α=0.2`, `γ=0.95`, ε-decay 0.96

### DQN (deep)

File: `packages/rl-python/train_dqn.py`

- Continuous action space, all 4 parameters scaled to [0, 1]
- Experience replay buffer (10 k), target network, checkpoint saves

```
reset → state s
loop:
  choose action a
  POST /rl/step { difficulty, maxTxsPerBlock, gossipFanout, mineIntervalMs }
  receive (state s', reward r)
  update Q(s,a) or neural network
```

## Simulation

`packages/simulation` generates controlled load for testing without RL.

| Scenario | Description |
|---|---|
| `SteadyLoad` | Constant TPS |
| `Burst` | Sudden traffic spikes |
| `Ramp` | Gradually increasing load |
| `StressTest` | Maximum sustained load |

```typescript
const runner = new SimulationRunner({ scenario: createScenario("burst") });
const result = await runner.run();
```

## Explorer

Next.js 16 + React 19 + TailwindCSS + Radix UI app on port 3001.

Proxies requests to the Node API (`http://localhost:3000`) via `/api/[...path]` to avoid CORS.

```
/                  → dashboard
/nodes             → network nodes
/blocks            → block list
/blocks/[index]    → block detail
/transactions      → transaction list
/transactions/[hash] → transaction detail
```

## Run

```bash
# Terminal 1 — Node API (port 3000)
bun run packages/node-api/src/server.ts

# Terminal 2 — Explorer UI (port 3001)
bun run --filter @liquid/explorer dev

# Terminal 3 — RL agent
cd packages/rl-python
python train_q_learning.py   # tabular Q-learning
# or
python train_dqn.py          # deep Q-network
```

## Data Flow

```
RL Agent / Client
      │
      ▼
POST /transactions ──► Node API ──► random NetworkNode ──► gossip broadcast
POST /mine         ──► Node API ──► target node ──► PoW mine ──► gossip broadcast
POST /rl/step      ──► Node API ──► set params, submit txs, mine, compute reward
      │
      ▼
Explorer (Next.js) ──► /api proxy ──► Node API ──► read chain state
```
