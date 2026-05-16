# RL Python Package

Reinforcement Learning agents for adaptive blockchain consensus.

## Architecture

This package implements RL algorithms to optimize blockchain parameters:

- **Difficulty**: Mining difficulty (1-12)
- **maxTxsPerBlock**: Block capacity (1-500)
- **gossipFanout**: Network propagation factor (0.0-1.0)
- **mineIntervalMs**: Target mining interval (100-10000ms)

## Algorithms

### 1. DQN (Deep Q-Network) - `train_dqn.py`

State-of-the-art deep RL using neural networks.

**Features:**

- Continuous action space
- Experience replay buffer
- Target network stabilization
- Neural network function approximation
- Model save/load

**Usage:**

```bash
# Training
python train_dqn.py

# Testing trained model
python train_dqn.py --test
```

### 2. Q-Learning (Legacy) - `train_q_learning.py`

Classic tabular Q-learning with discrete actions.

**Usage:**

```bash
python train_q_learning.py
```

## State Space

- `mempool_size`: Pending transactions (0-1000)
- `current_tps`: Transactions per second (0-100)
- `network_delay`: Network latency (0-500ms)
- `incoming_txs`: Incoming transactions (0-100)

## Action Space

**DQN** (Continuous):

- Each parameter is a continuous value [0,1], mapped to actual ranges
- Enables fine-grained control

**Q-Learning** (Discrete):

- 3 predefined action configurations
- Simpler but less flexible

## Prerequisites

1. Start API server:

```bash
cd packages/node-api && bun run dev
```

2. Install Python dependencies:

```bash
pip install requests numpy
```

## Training Process

The agent learns to:

1. **Maximize TPS** (transactions per second)
2. **Minimize latency** (network delay)
3. **Optimize resource usage** (penalizes invalid/dropped messages)

**Reward Function:**

```
reward = current_tps - (invalid_rate + dropped_rate + timeout_rate)
```

## Hyperparameters

### DQN

- Learning rate: 0.001
- Discount factor: 0.99
- Epsilon decay: 0.995
- Batch size: 32
- Replay buffer: 10000
- Target update: every 100 steps

### Q-Learning

- Learning rate: 0.2
- Discount factor: 0.95
- Epsilon decay: 0.96

## Integration with Other Packages

```
RL Python Package
       ↓ HTTP API calls
Node API Server (packages/node-api)
       ↓ Uses
Gossip Network (packages/network)
       ↓ Manages
Blockchain Nodes (packages/blockchain)
```

The RL agent treats the blockchain as an environment and learns optimal policies for consensus parameters.

## Model Output

Models are saved as JSON files:

- `dqn_model.json`: Current best model
- `dqn_model_ep{N}.json`: Checkpoints every 50 episodes
- `dqn_model_final.json`: Final trained model

## Results

After training, the agent learns to:

- Adjust difficulty based on network load
- Optimize block size for throughput
- Balance gossip fanout vs. latency
- Set appropriate mining intervals

This creates an **adaptive consensus algorithm** that responds to network conditions in real-time.
