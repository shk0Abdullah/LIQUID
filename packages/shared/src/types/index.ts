export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature?: string;
}

export interface BlockchainConfig {
  difficulty: number;
  miningReward: number;
  blockTime: number;
}

export interface ChainValidationResult {
  isValid: boolean;
  invalidIndex?: number;
  error?: string;
}

export interface MiningResult {
  block: Block;
  iterations: number;
  elapsedMs: number;
}

export interface ConsensusContext {
  height: number;
  difficulty: number;
  mempoolSize: number;
  averageBlockTimeMs: number;
}
