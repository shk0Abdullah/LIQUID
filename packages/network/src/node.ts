import { Blockchain, createTransaction } from "@liquid/blockchain";
import { type Transaction, type Block } from "@liquid/shared";
import { GossipProtocol, GossipNode } from "./gossip.js";
import {
  NetworkMessage,
  MessageType,
  TransactionPayload,
  BlockPayload,
} from "./message.js";

export interface NetworkNodeConfig {
  fanoutSize: number;
  broadcastSubsetSize1: number;
  broadcastSubsetSize2: number;
  useSubsets: boolean;
}

export const DEFAULT_NETWORK_NODE_CONFIG: NetworkNodeConfig = {
  fanoutSize: 2,
  broadcastSubsetSize1: 2,
  broadcastSubsetSize2: 2,
  useSubsets: true,
};

export class NetworkNode {
  public readonly id: string;
  public readonly blockchain: Blockchain;
  private gossipNode?: GossipNode;
  private gossip: GossipProtocol;
  private config: NetworkNodeConfig;
  private pendingBlocks: BlockPayload[] = [];

  constructor(
    id: string,
    blockchain: Blockchain,
    gossip: GossipProtocol,
    config: Partial<NetworkNodeConfig> = {},
  ) {
    this.id = id;
    this.blockchain = blockchain;
    this.gossip = gossip;
    this.config = { ...DEFAULT_NETWORK_NODE_CONFIG, ...config };
  }

  public static async create(
    id: string,
    gossip: GossipProtocol,
    config: Partial<NetworkNodeConfig> = {},
  ): Promise<NetworkNode> {
    const blockchain = await Blockchain.create();
    return new NetworkNode(id, blockchain, gossip, config);
  }

  // Register this node in the gossip network
  public register(): void {
    this.gossipNode = this.gossip.registerNode(this.id, (message) =>
      this.handleMessage(message),
    );
  }

  // Unregister from the gossip network
  public unregister(): void {
    this.gossip.unregisterNode(this.id);
  }

  // Get node info
  public getInfo() {
    const latestBlock = this.blockchain.getLatestBlock();
    return {
      id: this.id,
      height: this.blockchain.chain.length,
      pendingTxCount: this.blockchain.getPendingTransactionCount(),
      difficulty: this.blockchain.config.difficulty,
      latestHash: latestBlock.hash,
      neighborCount: this.gossipNode?.neighbors.size ?? 0,
      neighbors: this.gossipNode ? Array.from(this.gossipNode.neighbors) : [],
    };
  }

  // Submit transaction and broadcast via gossip
  public submitTransaction(
    from: string,
    to: string,
    amount: number,
  ): { txId: string; messageId: string } {
    // Create transaction
    const tx = createTransaction(from, to, amount);

    // Add to local blockchain mempool
    this.blockchain.addTransaction(tx);

    // Broadcast via gossip protocol
    const payload: TransactionPayload = {
      id: tx.id,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      timestamp: tx.timestamp,
    };

    const messageId = this.gossip.broadcastTransaction(
      this.id,
      payload,
      this.config.useSubsets,
      this.config.broadcastSubsetSize1,
      this.config.broadcastSubsetSize2,
    );

    return { txId: tx.id, messageId };
  }

  // Mine block and broadcast via gossip
  public async mine(minerAddress: string): Promise<{
    height: number;
    hash: string;
    pendingTxCount: number;
    messageId: string;
  }> {
    // Mine the block
    const block = await this.blockchain.minePendingTransactions(minerAddress);

    // Convert block to payload
    const payload: BlockPayload = {
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions.map((tx) => ({
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        timestamp: tx.timestamp,
      })),
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
    };

    // Broadcast via gossip protocol
    const messageId = this.gossip.broadcastBlock(
      this.id,
      payload,
      this.config.useSubsets,
      this.config.broadcastSubsetSize1,
      this.config.broadcastSubsetSize2,
    );

    return {
      height: this.blockchain.chain.length,
      hash: block.hash,
      pendingTxCount: this.blockchain.getPendingTransactionCount(),
      messageId,
    };
  }

  // Handle incoming gossip messages
  private handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case "TRANSACTION":
        this.handleTransaction(message.payload as TransactionPayload);
        break;
      case "BLOCK":
        this.handleBlock(message.payload as BlockPayload);
        break;
      default:
        // Ignore other message types for now
        break;
    }
  }

  // Handle received transaction
  private handleTransaction(payload: TransactionPayload): void {
    try {
      // Check if transaction already exists in mempool
      const existing = this.blockchain.pendingTransactions.find(
        (tx) => tx.id === payload.id,
      );
      if (existing) return;

      // Recreate transaction
      const tx = createTransaction(payload.from, payload.to, payload.amount);
      // Override the id to match the received transaction
      (tx as Transaction).id = payload.id;

      // Add to mempool
      this.blockchain.addTransaction(tx);
    } catch (error) {
      // Transaction validation failed, ignore
      console.warn(
        `[${this.id}] Failed to add transaction ${payload.id}:`,
        error,
      );
    }
  }

  // Handle received block
  private handleBlock(payload: BlockPayload): void {
    try {
      // Check if block already exists
      const existing = this.blockchain.chain.find(
        (b) => b.hash === payload.hash,
      );
      if (existing) return;

      // Check if we can add this block
      const latestBlock = this.blockchain.getLatestBlock();

      // Simple validation: check if previous hash matches
      if (payload.previousHash !== latestBlock.hash) {
        // Block doesn't fit our chain, queue it for later
        this.pendingBlocks.push(payload);
        return;
      }

      // Create block object and add to chain
      const block: Block = {
        index: payload.index,
        timestamp: payload.timestamp,
        transactions: payload.transactions.map((tx) => ({
          id: tx.id,
          from: tx.from,
          to: tx.to,
          amount: tx.amount,
          timestamp: tx.timestamp,
        })),
        previousHash: payload.previousHash,
        hash: payload.hash,
        nonce: payload.nonce,
      };

      // Add to chain
      this.blockchain.chain.push(block);

      // Remove transactions that were included in the block from mempool
      const txIdsInBlock = new Set(block.transactions.map((tx) => tx.id));
      const remainingPending = this.blockchain.pendingTransactions.filter(
        (tx) => !txIdsInBlock.has(tx.id),
      );
      this.blockchain.pendingTransactions.length = 0;
      this.blockchain.pendingTransactions.push(...remainingPending);

      // Try to process any pending blocks
      this.processPendingBlocks();
    } catch (error) {
      console.warn(`[${this.id}] Failed to add block ${payload.hash}:`, error);
    }
  }

  // Process pending blocks that might now fit
  private processPendingBlocks(): void {
    const processed: BlockPayload[] = [];

    for (const payload of this.pendingBlocks) {
      const latestBlock = this.blockchain.getLatestBlock();

      if (payload.previousHash === latestBlock.hash) {
        // Can add this block now
        const block: Block = {
          index: payload.index,
          timestamp: payload.timestamp,
          transactions: payload.transactions.map((tx) => ({
            id: tx.id,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            timestamp: tx.timestamp,
          })),
          previousHash: payload.previousHash,
          hash: payload.hash,
          nonce: payload.nonce,
        };

        this.blockchain.chain.push(block);

        // Remove transactions
        const txIdsInBlock = new Set(block.transactions.map((tx) => tx.id));
        const remainingPending = this.blockchain.pendingTransactions.filter(
          (tx) => !txIdsInBlock.has(tx.id),
        );
        this.blockchain.pendingTransactions.length = 0;
        this.blockchain.pendingTransactions.push(...remainingPending);

        processed.push(payload);
      }
    }

    // Remove processed blocks
    this.pendingBlocks = this.pendingBlocks.filter(
      (b) => !processed.includes(b),
    );
  }

  // Set difficulty
  public setDifficulty(difficulty: number): void {
    this.blockchain.setDifficulty(difficulty);
  }

  // Set max transactions per block
  public setMaxTransactionsPerBlock(limit: number): void {
    this.blockchain.setMaxTransactionsPerBlock(limit);
  }

  // Get neighbors
  public getNeighbors(): string[] {
    return this.gossipNode ? Array.from(this.gossipNode.neighbors) : [];
  }

  // Discover new neighbors
  public discoverNeighbors(): void {
    this.gossip.discoverNeighbors(this.id);
  }
}
