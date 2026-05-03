# Blockchain Q-Learning Simulation

A full-stack prototype simulating a blockchain network with Q-learning based adaptive consensus. Multiple nodes communicate over a simulated P2P network with realistic conditions (latency, packet loss, forks), and one node uses reinforcement learning to optimize its consensus strategy.

## Architecture

```
root/
├── python-sim/          # Python blockchain simulation
│   ├── main.py          # Entry point & training loop
│   ├── block.py         # Block structure
│   ├── node.py          # Node logic
│   ├── network.py       # Network simulation
│   ├── rl_agent.py      # Q-learning implementation
│   ├── environment.py   # RL environment
│   ├── metrics.py       # Metrics collection
│   └── requirements.txt # Python dependencies
│
├── server/              # TypeScript API server
│   └── src/
│       ├── index.ts     # Express server
│       ├── router.ts    # tRPC router
│       └── simulation.ts # Simulation service
│
└── web/                 # React frontend
    └── src/
        ├── App.tsx
        └── components/
            ├── Dashboard.tsx
            └── MetricsChart.tsx
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Or manually:
cd python-sim && pip install -r requirements.txt
cd ../server && npm install
cd ../web && npm install
```

### Running the Application

Open three terminal windows:

**Terminal 1 - API Server:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:3001

**Terminal 2 - Web Frontend:**
```bash
cd web
npm run dev
```
Frontend runs on http://localhost:3000

**Terminal 3 - Test Python Simulation:**
```bash
cd python-sim
python main.py --episodes 50 --verbose
```

## Features

### Python Simulation
- **Blockchain Core**: Simple block structure with SHA-256 hashing
- **Network Simulation**: Realistic P2P with latency, packet loss, and forks
- **Q-Learning Agent**: Tabular Q-learning (no deep RL)
  - State: (confirmations, fork_length, peer_trust)
  - Actions: accept, reject, wait
  - Reward: +10 consensus, -5 forks, -2 delay
- **Training**: Configurable episodes with epsilon-greedy exploration
- **Metrics**: JSON export for visualization

### API Layer
- **tRPC**: Type-safe API definition
- **Effect**: Structured error handling and logging
- **Express**: REST endpoints for simpler integration
- **Child Process**: Spawns Python simulation on demand

### Frontend
- **Dashboard**: Real-time metrics display
- **Charts**: Line, area, and bar charts with Recharts
- **Statistics**: Summary cards with key metrics
- **Table**: Episode-by-episode results
- **Controls**: Configure and run simulations

## API Endpoints

- `GET /health` - Health check
- `GET /metrics` - Get existing simulation metrics
- `POST /simulation/run` - Run simulation (body: `{ episodes: number }`)
- `POST /trpc/*` - tRPC endpoints

## Configuration

### Python Simulation
Edit `python-sim/main.py` or pass command-line args:
- `--episodes N` - Number of training episodes
- `--verbose` - Enable detailed output
- `--quiet` - Suppress output

### Network Parameters
Edit `python-sim/network.py`:
- `num_nodes` - Number of nodes (default: 5)
- `drop_rate` - Packet loss probability (default: 0.1)
- `fork_probability` - Fork chance (default: 0.15)
- `base_latency` - Base network latency (default: 0.05s)

### RL Agent Parameters
Edit `python-sim/rl_agent.py`:
- `learning_rate` - Q-learning alpha (default: 0.15)
- `discount_factor` - Gamma (default: 0.95)
- `exploration_rate` - Initial epsilon (default: 0.4)
- `exploration_decay` - Epsilon decay per episode (default: 0.99)

## How It Works

1. **Episode Setup**: Network reset, all nodes start with genesis block
2. **Mining Rounds**: Non-RL nodes mine blocks and broadcast
3. **RL Agent Decisions**: Agent observes state, chooses action
   - **accept**: Add block to chain
   - **reject**: Discard block
   - **wait**: Gather more information
4. **Network Simulation**: Messages delayed/dropped, forks occur
5. **Reward Calculation**: Based on consensus success, forks, delays
6. **Q-Table Update**: Bellman equation updates action values
7. **Exploration Decay**: Epsilon decreases over episodes
8. **Metrics Export**: Results saved to JSON

## Metrics

The simulation tracks:
- **Total Reward** per episode
- **Consensus Time** (simulated seconds)
- **Fork Count** (network conflicts)
- **Accuracy** (consensus success rate)
- **Exploration Rate** (epsilon decay)
- **Blocks Accepted/Rejected** counts

## Project Structure

### Backend (Python)
- `block.py`: Immutable block with hash
- `node.py`: Chain management, validation
- `network.py`: Latency, drops, forks
- `rl_agent.py`: Q-table, action selection
- `environment.py`: RL environment interface
- `metrics.py`: Data collection
- `main.py`: Training orchestration

### API (TypeScript)
- `index.ts`: Express server setup
- `router.ts`: tRPC schema definition
- `simulation.ts`: Python execution service

### Frontend (React)
- `Dashboard.tsx`: Main UI component
- `MetricsChart.tsx`: Chart rendering
- `App.tsx`: Root component with styles

## Development

### Running Python Tests
```bash
cd python-sim
python -m pytest
```

### Building for Production
```bash
# Build all components
npm run build

# Or individually:
cd server && npm run build
cd ../web && npm run build
```

### Linting
```bash
cd server && npm run lint
cd ../web && npm run lint
```

## Educational Value

This project demonstrates:
- **Blockchain Fundamentals**: Blocks, chains, validation
- **Network Simulation**: Realistic P2P conditions
- **Reinforcement Learning**: Q-learning without deep RL
- **Full-Stack Integration**: Python + TypeScript + React
- **Metrics & Visualization**: Data-driven insights

## License

MIT

## Troubleshooting

**Python not found**: Ensure Python 3.8+ is installed and in PATH

**Module not found**: Run `pip install -r python-sim/requirements.txt`

**CORS errors**: Check API server is running on port 3001

**Empty metrics**: Run simulation first via dashboard or API
