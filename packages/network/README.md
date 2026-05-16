# @liquid/network

A gossip protocol implementation for the blockchain network.

## Overview

This package implements a realistic peer-to-peer gossip protocol where:

- Nodes maintain a limited set of neighbors (max 5 by default)
- Messages propagate through the network via gossip (random fanout)
- Broadcasting uses **two random subsets** instead of flooding all nodes
- Transactions and blocks spread organically through neighbor connections

## Architecture

```
GossipProtocol
    ├── GossipNode (id, neighbors, receivedMessages)
    ├── broadcast() → picks random neighbors (fanoutSize)
    └── broadcastWithSubsets() → picks two random subsets

NetworkNode
    ├── Blockchain instance
    ├── GossipNode connection
    ├── submitTransaction() → gossip broadcast
    └── mine() → gossip broadcast block
```

## Key Features

### 1. Random Subset Broadcasting

Instead of sending to ALL nodes like the old implementation:

```typescript
// OLD: Sends to every node
for (const chain of this.nodes.values()) {
  chain.addTransaction(tx); // Everyone gets it
}

// NEW: Gossip protocol - sends to random subsets
const subset1 = getRandomNeighbors(nodeId, subsetSize1);
const subset2 = getRandomNeighbors(nodeId, subsetSize2);
// Only these subsets receive the message initially
```

### 2. Fanout-Based Propagation

Messages propagate through the network:

1. Sender picks 2 random neighbors (default fanout)
2. Each receiver marks message as seen
3. Each receiver forwards to their random neighbors
4. TTL decreases with each hop (default 10)
5. Message dies when TTL reaches 0 or all nodes have seen it

### 3. Neighbor Management

- Each node maintains 2-5 neighbors (configurable)
- Bidirectional connections (A is neighbor of B → B is neighbor of A)
- Discovery algorithm can find new neighbors periodically
- Network forms a mesh topology naturally

## Configuration

```typescript
const network = await BlockchainNetwork.create(10, {
  fanoutSize: 2, // How many neighbors to forward to
  broadcastSubsetSize1: 2, // First subset size for initial broadcast
  broadcastSubsetSize2: 2, // Second subset size for initial broadcast
  useSubsets: true, // Enable subset broadcasting
  maxNeighbors: 5, // Max neighbors per node
});
```

## API Endpoints (via node-api)

### GET /network/topology

Returns the current network topology with neighbor connections.

```json
{
  "topology": [
    {
      "nodeId": "node-1",
      "neighborCount": 3,
      "neighbors": ["node-2", "node-3", "node-4"]
    }
  ],
  "nodeCount": 10
}
```

### POST /network/discover

Triggers neighbor discovery for all nodes.

### POST /transactions

Submits transaction via gossip (returns txId and messageId).

### POST /mine

Mines block and broadcasts via gossip (returns messageId for tracking).

## Message Flow Example

```
Transaction submitted to Node-1
    │
    ├── Subset 1: [Node-2, Node-3]
    │   ├── Node-2 forwards to [Node-4, Node-5]
    │   └── Node-3 forwards to [Node-6, Node-1] (ignored, already seen)
    │
    └── Subset 2: [Node-7, Node-8]
        ├── Node-7 forwards to [Node-9, Node-2] (Node-2 already seen)
        └── Node-8 forwards to [Node-10, Node-3] (Node-3 already seen)

Result: Transaction eventually reaches all nodes through gossip propagation
```

## Benefits vs Old Implementation

| Aspect            | Old                         | New (Gossip)              |
| ----------------- | --------------------------- | ------------------------- |
| Broadcast         | All nodes (O(n))            | Random subsets (O(log n)) |
| Network traffic   | High                        | Scalable                  |
| Realism           | None (direct memory access) | Realistic P2P simulation  |
| Propagation       | Instant everywhere          | Organic spread            |
| Neighbor topology | None                        | Mesh network              |

## Usage

```typescript
import { BlockchainNetwork } from "@liquid/node-api";

// Create network with gossip protocol
const network = await BlockchainNetwork.create(10);

// Submit transaction (gossip broadcast)
const { txId, messageId } = network.submitTransaction("alice", "bob", 100);

// Mine block (gossip broadcast)
const result = await network.mine("node-1", "miner-address");
// Returns: { height, hash, pendingTxCount, messageId }

// View network topology
const topology = network.getNetworkTopology();
```
