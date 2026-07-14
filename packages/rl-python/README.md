# RL Python Package

Multi-agent DQN with sub-policy architecture for adaptive blockchain consensus.

## Architecture

Each node in the blockchain network gets its own independent DQN agent with 3 sub-policy heads:

| Sub-Policy       | Action Space | Actions                                   |
| ---------------- | ------------ | ----------------------------------------- |
| `difficulty`     | 9 discrete   | 1, 2, 3, 4, 5, 6, 8, 10, 12               |
| `maxTxsPerBlock` | 7 discrete   | 5, 10, 20, 30, 50, 80, 100                |
| `gossipFanout`   | 5 discrete   | 1, 2, 3, 4, 5 (normalized to 0-1 for API) |

Each sub-policy is a small `Linear(4→64)→ReLU→Linear(64→32)→ReLU→Linear(32→N)` network. They share the same state observation but produce independent action selections. This avoids the exponential action space of joint actions (9×7×5=315 vs 9+7+5=21 outputs).

## State Space

Each node observes 4 local state variables:

| State               | Normalization    | Source                          |
| ------------------- | ---------------- | ------------------------------- |
| `mempool_size`      | / 1000           | `node.pendingTxCount`           |
| `block_utilization` | as-is (0-1)      | `node.metrics.blockUtilization` |
| `forks_detected`    | cap 10, / 10     | `node.metrics.forksDetected`    |
| `block_interval_ms` | cap 30s, / 30000 | `node.metrics.blockIntervalMs`  |

## Reward Function

**Measured from real network behavior** (not synthetic formulas):

```
reward = txs_confirmed - fork_penalty * forks_detected
```

Where `fork_penalty = 3.0` (a fork costs 3x a confirmed tx).

## Prerequisites

1. Start API server:

```bash
cd packages/node-api && bun run dev
```

2. Install Python dependencies:

```bash
pip install torch requests
```

## Usage

```bash
# Training (default: 200 episodes, 50 steps/episode)
python train_dqn.py

# Training with simulated network latency (causes real forks)
python train_dqn.py --propagation-delay 50

# Test trained agent
python train_dqn.py --test

# Test with latency
python train_dqn.py --test --propagation-delay 50
```

## Per-Node RL Environment

The `/rl/step` endpoint accepts per-node actions:

```json
POST /rl/step
{
  "incomingTxs": 10,
  "actions": {
    "node-1": { "difficulty": 3, "maxTxsPerBlock": 20, "gossipFanout": 0.4 },
    "node-2": { "difficulty": 5, "maxTxsPerBlock": 10, "gossipFanout": 0.6 },
    "node-3": { "difficulty": 2, "maxTxsPerBlock": 30, "gossipFanout": 0.8 }
  }
}
```

Each node receives its own reward based on its local metrics.

## Hyperparameters

- Learning rate: 0.001
- Discount factor: 0.95
- Epsilon decay: 0.97 per episode
- Batch size: 32
- Replay buffer: 5000
- Target network update: every 50 steps
- Episodes: 200
- Steps per episode: 50

## Model Files

Models are saved as PyTorch `.pt` files:

- `dqn_model.pt`: Auto-loaded on restart
- `dqn_model_ep{N}.pt`: Checkpoints every 50 episodes
- `dqn_model_final.pt`: Final trained model

## Integration

```
Multi-Agent DQN (Python/PyTorch)
        ↓ Per-node actions via HTTP
Node API Server (packages/node-api)
        ↓ Per-node difficulty/txs/fanout
Gossip Network (packages/network)
        ↓ Real metrics: forks, intervals, utilization
Blockchain Nodes (packages/blockchain)
```

## Propagation Delay

Use `--propagation-delay N` to introduce simulated network latency (ms). This creates the conditions for forks — when propagation delay exceeds block interval, multiple nodes mine at the same height. Without delay, gossip is instant and forks never occur.
