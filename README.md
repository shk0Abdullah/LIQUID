# blockchain-rl

Mini PoW blockchain + Node API + Python Q-learning starter.

## Architecture

```text
packages/shared
  -> types/constants used by all packages

packages/blockchain
  -> core chain logic (tx validation, block hash, PoW mining, chain validation)

packages/node-api
  -> HTTP endpoints over blockchain package

packages/rl-python
  -> Q-learning trainer calling Node API
```

## Flow (Visual)

```text
Client / RL Agent
      |
      v
POST /transactions  ---> Node API ---> add tx to all node mempools
POST /mine          ---> Node API ---> selected node mines PoW block
GET  /network/state ---> Node API ---> returns node count, heights, pending tx
```

## PoW + Validation

```text
hash = SHA256(index || timestamp || previousHash || nonce || transactions)

Valid block if:
1) index = prev.index + 1
2) previousHash = prev.hash
3) recomputedHash = stored hash
4) hash starts with "0" * difficulty
5) all transactions are valid
```

## Node API Endpoints

- `GET /health`
- `GET /network/nodes`
- `GET /network/state`
- `POST /network/nodes`
- `POST /network/reset`
- `POST /transactions`
- `POST /mine`
- `GET /chain?nodeId=node-1`
- `POST /rl/reset`
- `POST /rl/step`

## RL Loop (Q-learning Visual)

```text
reset -> state s
loop:
  choose action a in {-1, 0, +1} (difficultyDelta)
  call POST /rl/step
  receive next_state s', reward r
  update Q(s,a)
```

## Run

1. Start API (from repo root):

```bash
bun run packages/node-api/src/server.ts
```

2. Run RL trainer (new terminal):

```bash
python packages/rl-python/train_q_learning.py
```

## Current Scope

- Simple PoW blockchain baseline
- Multi-node network abstraction in API package
- RL-ready endpoints and initial Q-learning integration
