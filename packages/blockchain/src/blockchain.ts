import {
  DEFAULT_BLOCK_TIME,
  DEFAULT_DIFFICULTY,
  DEFAULT_MINING_REWARD,
  GENESIS_BLOCK_PREVIOUS_HASH,
  MAX_TRANSACTIONS_PER_BLOCK,
  type Block,
  type BlockchainConfig,
  type ChainValidationResult,
  type Transaction,
} from "@liquid/shared";
import {
  calculateBlockHash,
  createBlock,
  createGenesisBlock,
  isValidProofOfWork,
  mineBlock,
  validateBlock,
} from "./block.js";
import { createTransaction, validateTransaction } from "./transaction.js";

export class Blockchain {
  public readonly chain: Block[] = [];
  public readonly pendingTransactions: Transaction[] = [];
  public readonly config: BlockchainConfig;

  private constructor(config?: Partial<BlockchainConfig>) {
    this.config = {
      difficulty: config?.difficulty ?? DEFAULT_DIFFICULTY,
      miningReward: config?.miningReward ?? DEFAULT_MINING_REWARD,
      blockTime: config?.blockTime ?? DEFAULT_BLOCK_TIME,
    };
  }

  public static async create(config?: Partial<BlockchainConfig>): Promise<Blockchain> {
    const blockchain = new Blockchain(config);
    const genesis = await createGenesisBlock(blockchain.config.difficulty);
    blockchain.chain.push(genesis);
    return blockchain;
  }

  public getLatestBlock(): Block {
    const latest = this.chain.at(-1);
    if (!latest) {
      throw new Error("Blockchain is not initialized");
    }

    return latest;
  }

  public addTransaction(transaction: Transaction): void {
    if (!validateTransaction(transaction)) {
      throw new Error("Invalid transaction");
    }

    this.pendingTransactions.push(transaction);
  }

  public async minePendingTransactions(minerAddress: string): Promise<Block> {
    if (typeof minerAddress !== "string" || minerAddress.trim() === "") {
      throw new Error("Miner address must be a non-empty string");
    }

    const rewardTransaction = createTransaction("SYSTEM", minerAddress, this.config.miningReward);
    const maxPendingTransactions = Math.max(0, MAX_TRANSACTIONS_PER_BLOCK - 1);
    const selectedPendingTransactions = this.pendingTransactions.slice(0, maxPendingTransactions);
    const blockTransactions = [rewardTransaction, ...selectedPendingTransactions];

    const candidateBlock = createBlock(
      this.chain.length,
      blockTransactions,
      this.getLatestBlock().hash,
      0,
    );

    const { block } = await mineBlock(candidateBlock, this.config.difficulty);
    const isBlockValid = await validateBlock(block, this.getLatestBlock(), this.config.difficulty);
    if (!isBlockValid) {
      throw new Error("Mined block failed validation");
    }

    this.chain.push(block);
    this.pendingTransactions.splice(0, selectedPendingTransactions.length);
    return block;
  }

  public async isChainValid(): Promise<ChainValidationResult> {
    if (this.chain.length === 0) {
      return {
        isValid: false,
        error: "Chain has no genesis block",
      };
    }

    const genesisBlock = this.chain[0];
    const genesisHash = await calculateBlockHash(genesisBlock);
    if (genesisBlock.index !== 0 || genesisBlock.previousHash !== GENESIS_BLOCK_PREVIOUS_HASH) {
      return {
        isValid: false,
        invalidIndex: 0,
        error: "Invalid genesis index or previous hash",
      };
    }

    if (genesisHash !== genesisBlock.hash) {
      return {
        isValid: false,
        invalidIndex: 0,
        error: "Invalid genesis hash",
      };
    }

    if (!isValidProofOfWork(genesisBlock.hash, this.config.difficulty)) {
      return {
        isValid: false,
        invalidIndex: 0,
        error: "Genesis proof-of-work does not satisfy difficulty",
      };
    }

    for (let i = 1; i < this.chain.length; i += 1) {
      const previousBlock = this.chain[i - 1];
      const block = this.chain[i];
      const valid = await validateBlock(block, previousBlock, this.config.difficulty);

      if (!valid) {
        return {
          isValid: false,
          invalidIndex: i,
          error: "Invalid block linkage, hash, proof-of-work, or transactions",
        };
      }
    }

    return { isValid: true };
  }
}
