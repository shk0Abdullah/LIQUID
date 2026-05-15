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

export interface NodeInfo {
  id: string;
  address: string;
  peers: string[];
  chainLength: number;
  pendingTxCount: number;
  difficulty: number;
  maxTransactionsPerBlock: number;
}

export interface NetworkState {
  nodes: NodeInfo[];
}

