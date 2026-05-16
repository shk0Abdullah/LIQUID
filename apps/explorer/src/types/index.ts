export interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  timestamp: number
  signature?: string
}

export interface Block {
  index: number
  timestamp: number
  transactions: Transaction[]
  previousHash: string
  hash: string
  nonce: number
}

export interface NodeInfo {
  id: string
  height: number
  pendingTxCount: number
  difficulty: number
  latestHash: string
  neighborCount: number
  neighbors: string[]
}

export interface NetworkState {
  nodes: NodeInfo[]
}

export interface ChainResponse {
  nodeId: string
  chain: Block[]
}

export interface TxRow extends Transaction {
  blockIndex: number
  blockHash: string
}
