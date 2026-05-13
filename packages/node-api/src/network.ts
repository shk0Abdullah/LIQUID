import { Blockchain, createTransaction } from "../../blockchain/src/index.ts";

export interface NodeInfo {
  id: string;
  height: number;
  pendingTxCount: number;
  difficulty: number;
  latestHash: string;
}

export class BlockchainNetwork {
  private nodes = new Map<string, Blockchain>();

  public static async create(nodeCount = 3): Promise<BlockchainNetwork> {
    const network = new BlockchainNetwork();
    await network.reset(nodeCount);
    return network;
  }

  public async reset(nodeCount = 3): Promise<void> {
    this.nodes.clear();
    for (let i = 0; i < nodeCount; i += 1) {
      const id = `node-${i + 1}`;
      const chain = await Blockchain.create();
      this.nodes.set(id, chain);
    }
  }

  public async addNode(): Promise<NodeInfo> {
    const id = `node-${this.nodes.size + 1}`;
    const chain = await Blockchain.create();
    this.nodes.set(id, chain);
    return this.toNodeInfo(id, chain);
  }

  public listNodes(): NodeInfo[] {
    return Array.from(this.nodes.entries()).map(([id, chain]) => this.toNodeInfo(id, chain));
  }

  public submitTransaction(from: string, to: string, amount: number): { txId: string } {
    const tx = createTransaction(from, to, amount);
    for (const chain of this.nodes.values()) {
      chain.addTransaction(tx);
    }

    return { txId: tx.id };
  }

  public async mine(nodeId: string, minerAddress: string): Promise<{
    nodeId: string;
    height: number;
    hash: string;
    pendingTxCount: number;
  }> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const block = await node.minePendingTransactions(minerAddress);
    return {
      nodeId,
      height: node.chain.length,
      hash: block.hash,
      pendingTxCount: node.getPendingTransactionCount(),
    };
  }

  public setDifficultyForAll(difficulty: number): void {
    for (const node of this.nodes.values()) {
      node.setDifficulty(difficulty);
    }
  }

  public getState(): {
    nodeCount: number;
    nodes: NodeInfo[];
    maxHeight: number;
    avgPendingTxCount: number;
  } {
    const nodes = this.listNodes();
    const maxHeight = nodes.reduce((acc, node) => Math.max(acc, node.height), 0);
    const totalPending = nodes.reduce((acc, node) => acc + node.pendingTxCount, 0);

    return {
      nodeCount: nodes.length,
      nodes,
      maxHeight,
      avgPendingTxCount: nodes.length === 0 ? 0 : totalPending / nodes.length,
    };
  }

  public getNodeChain(nodeId: string) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    return node.chain;
  }

  private toNodeInfo(id: string, chain: Blockchain): NodeInfo {
    return {
      id,
      height: chain.chain.length,
      pendingTxCount: chain.getPendingTransactionCount(),
      difficulty: chain.config.difficulty,
      latestHash: chain.getLatestBlock().hash,
    };
  }
}
