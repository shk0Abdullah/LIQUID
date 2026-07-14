export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface NodeMetrics {
  forksDetected: number;
  blocksReceived: number;
  blocksAccepted: number;
  blocksRejected: number;
  txsConfirmed: number;
  lastBlockTimestamp: number;
  blockIntervalMs: number;
  blockUtilization: number;
}

export interface NodeInfo {
  id: string;
  height: number;
  pendingTxCount: number;
  difficulty: number;
  latestHash: string;
  neighborCount: number;
  neighbors: string[];
  metrics: NodeMetrics;
}

export interface GossipMetrics {
  messagesSent: number;
  messagesDeduped: number;
  messagesDelivered: number;
  averageHops: number;
  totalHops: number;
  deliveriesTracked: number;
}

export interface NetworkState {
  nodeCount: number;
  nodes: NodeInfo[];
  maxHeight: number;
  avgPendingTxCount: number;
  propagationDelayMs: number;
  gossipMetrics: GossipMetrics;
  networkTopology: {
    nodeId: string;
    neighborCount: number;
    neighbors: string[];
  }[];
}

export interface ChainResponse {
  nodeId: string;
  chain: Block[];
}

export interface TxRow extends Transaction {
  blockIndex: number;
  blockHash: string;
}
