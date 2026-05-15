# RL Python (Q-learning)

This package trains a simple Q-learning agent against the Node API.

## Prerequisites

1. Start API server:
   - `cmd /c bun --filter @liquid/node-api run dev`
2. Python 3.10+
3. Install dependency:
   - `pip install requests`

## Run training

```bash
python train_q_learning.py
```

The script uses:
- `POST /rl/reset` (returns simplified state)
- `POST /rl/step` with adaptive action fields:
  - `difficulty`
  - `maxTxsPerBlock`
  - `gossipFanout`
  - `mineIntervalMs`
  - `incomingTxs`
