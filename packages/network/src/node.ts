import {
  Blockchain,
  createTransaction,
  validateBlock,
} from "@liquid/blockchain";
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
  private metrics: NodeMetrics = {
    forksDetected: 0,
    blocksReceived: 0,
    blocksAccepted: 0,
    blocksRejected: 0,
    txsConfirmed: 0,
    lastBlockTimestamp: 0,
    blockIntervalMs: 0,
    blockUtilization: 0,
  };

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
    const genesis = blockchain.getLatestBlock();
    this.metrics.lastBlockTimestamp = genesis.timestamp;
  }

  public static async create(
    id: string,
    gossip: GossipProtocol,
    config: Partial<NetworkNodeConfig> = {},
  ): Promise<NetworkNode> {
    const blockchain = await Blockchain.create();
    return new NetworkNode(id, blockchain, gossip, config);
  }

  public register(): void {
    this.gossipNode = this.gossip.registerNode(this.id, (message) =>
      this.handleMessage(message),
    );
  }

  public unregister(): void {
    this.gossip.unregisterNode(this.id);
  }

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

  public getMetrics(): NodeMetrics {
    const latestBlock = this.blockchain.getLatestBlock();
    const maxTxs = this.blockchain.getMaxTransactionsPerBlock();
    const nonRewardTxs = latestBlock.transactions.filter(
      (tx) => tx.from !== "SYSTEM",
    ).length;
    return {
      ...this.metrics,
      blockUtilization: maxTxs > 0 ? nonRewardTxs / maxTxs : 0,
    };
  }

  public resetMetrics(): void {
    this.metrics = {
      forksDetected: 0,
      blocksReceived: 0,
      blocksAccepted: 0,
      blocksRejected: 0,
      txsConfirmed: 0,
      lastBlockTimestamp: this.blockchain.getLatestBlock().timestamp,
      blockIntervalMs: 0,
      blockUtilization: 0,
    };
  }

  public submitTransaction(
    from: string,
    to: string,
    amount: number,
  ): { txId: string; messageId: string } {
    const tx = createTransaction(from, to, amount);
    this.blockchain.addTransaction(tx);

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

  public async mine(minerAddress: string): Promise<{
    height: number;
    hash: string;
    pendingTxCount: number;
    messageId: string;
  }> {
    const block = await this.blockchain.minePendingTransactions(minerAddress);

    const now = Date.now();
    this.metrics.blockIntervalMs = now - this.metrics.lastBlockTimestamp;
    this.metrics.lastBlockTimestamp = now;
    const nonRewardTxs = block.transactions.filter(
      (tx) => tx.from !== "SYSTEM",
    ).length;
    this.metrics.txsConfirmed += nonRewardTxs;
    this.metrics.blocksAccepted++;

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

  private handleMessage(message: NetworkMessage): void {
    switch (message.type) {
      case "TRANSACTION":
        this.handleTransaction(message.payload as TransactionPayload);
        break;
      case "BLOCK":
        this.handleBlock(message.payload as BlockPayload);
        break;
      default:
        break;
    }
  }

  private handleTransaction(payload: TransactionPayload): void {
    try {
      const existing = this.blockchain.pendingTransactions.find(
        (tx) => tx.id === payload.id,
      );
      if (existing) return;

      const tx: Transaction = {
        id: payload.id,
        from: payload.from,
        to: payload.to,
        amount: payload.amount,
        timestamp: payload.timestamp,
      };

      this.blockchain.addTransaction(tx);
    } catch (error) {
      console.warn(
        `[${this.id}] Failed to add transaction ${payload.id}:`,
        error,
      );
    }
  }

  private blockPayloadToBlock(payload: BlockPayload): Block {
    return {
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
  }

  private removeBlockTxsFromMempool(block: Block): void {
    const txIdsInBlock = new Set(block.transactions.map((tx) => tx.id));
    const remainingPending = this.blockchain.pendingTransactions.filter(
      (tx) => !txIdsInBlock.has(tx.id),
    );
    this.blockchain.pendingTransactions.length = 0;
    this.blockchain.pendingTransactions.push(...remainingPending);
  }

  private async addValidBlock(payload: BlockPayload): Promise<boolean> {
    const latestBlock = this.blockchain.getLatestBlock();
    this.metrics.blocksReceived++;

    if (payload.previousHash !== latestBlock.hash) {
      const conflicting = this.pendingBlocks.find(
        (b) => b.index === payload.index,
      );
      if (conflicting || payload.index === latestBlock.index + 1) {
        this.metrics.forksDetected++;
      }
      this.pendingBlocks.push(payload);
      return false;
    }

    const block = this.blockPayloadToBlock(payload);

    const isValid = await validateBlock(
      block,
      latestBlock,
      this.blockchain.config.difficulty,
    );
    if (!isValid) {
      this.metrics.blocksRejected++;
      return false;
    }

    this.blockchain.chain.push(block);
    this.removeBlockTxsFromMempool(block);
    this.metrics.blocksAccepted++;

    const now = Date.now();
    this.metrics.blockIntervalMs = now - this.metrics.lastBlockTimestamp;
    this.metrics.lastBlockTimestamp = now;
    const nonRewardTxs = block.transactions.filter(
      (tx) => tx.from !== "SYSTEM",
    ).length;
    this.metrics.txsConfirmed += nonRewardTxs;

    await this.processPendingBlocks();
    return true;
  }

  private handleBlock(payload: BlockPayload): void {
    try {
      const existing = this.blockchain.chain.find(
        (b) => b.hash === payload.hash,
      );
      if (existing) return;

      this.addValidBlock(payload);
    } catch (error) {
      console.warn(`[${this.id}] Failed to add block ${payload.hash}:`, error);
    }
  }

  private async processPendingBlocks(): Promise<void> {
    const processed: BlockPayload[] = [];

    for (const payload of this.pendingBlocks) {
      const latestBlock = this.blockchain.getLatestBlock();

      if (payload.previousHash === latestBlock.hash) {
        const block = this.blockPayloadToBlock(payload);
        const isValid = await validateBlock(
          block,
          latestBlock,
          this.blockchain.config.difficulty,
        );

        if (isValid) {
          this.blockchain.chain.push(block);
          this.removeBlockTxsFromMempool(block);
          this.metrics.blocksAccepted++;

          const now = Date.now();
          this.metrics.blockIntervalMs = now - this.metrics.lastBlockTimestamp;
          this.metrics.lastBlockTimestamp = now;
          const nonRewardTxs = block.transactions.filter(
            (tx) => tx.from !== "SYSTEM",
          ).length;
          this.metrics.txsConfirmed += nonRewardTxs;

          processed.push(payload);
        }
      }
    }

    this.pendingBlocks = this.pendingBlocks.filter(
      (b) => !processed.includes(b),
    );
  }

  public setDifficulty(difficulty: number): void {
    this.blockchain.setDifficulty(difficulty);
  }

  public setMaxTransactionsPerBlock(limit: number): void {
    this.blockchain.setMaxTransactionsPerBlock(limit);
  }

  public getNeighbors(): string[] {
    return this.gossipNode ? Array.from(this.gossipNode.neighbors) : [];
  }

  public discoverNeighbors(): void {
    this.gossip.discoverNeighbors(this.id);
  }
}
