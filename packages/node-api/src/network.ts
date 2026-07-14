import { GossipProtocol, NetworkNode } from "@liquid/network";
import type { NodeMetrics } from "@liquid/network";
import type { Block } from "@liquid/shared";

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

export interface GossipNetworkConfig {
  fanoutSize: number;
  broadcastSubsetSize1: number;
  broadcastSubsetSize2: number;
  useSubsets: boolean;
  maxNeighbors: number;
  propagationDelayMs: number;
}

export const DEFAULT_GOSSIP_NETWORK_CONFIG: GossipNetworkConfig = {
  fanoutSize: 2,
  broadcastSubsetSize1: 2,
  broadcastSubsetSize2: 2,
  useSubsets: true,
  maxNeighbors: 5,
  propagationDelayMs: 0,
};

export class BlockchainNetwork {
  private nodes = new Map<string, NetworkNode>();
  private gossip: GossipProtocol;
  private config: GossipNetworkConfig;

  constructor(config: Partial<GossipNetworkConfig> = {}) {
    this.config = { ...DEFAULT_GOSSIP_NETWORK_CONFIG, ...config };
    this.gossip = new GossipProtocol({
      fanoutSize: this.config.fanoutSize,
      maxNeighbors: this.config.maxNeighbors,
      propagationDelayMs: this.config.propagationDelayMs,
    });
  }

  public static async create(
    nodeCount = 3,
    config: Partial<GossipNetworkConfig> = {},
  ): Promise<BlockchainNetwork> {
    const network = new BlockchainNetwork(config);
    await network.reset(nodeCount);
    return network;
  }

  public async reset(nodeCount = 3): Promise<void> {
    for (const node of this.nodes.values()) {
      node.unregister();
    }
    this.nodes.clear();
    this.gossip.reset();

    this.gossip = new GossipProtocol({
      fanoutSize: this.config.fanoutSize,
      maxNeighbors: this.config.maxNeighbors,
      propagationDelayMs: this.config.propagationDelayMs,
    });

    for (let i = 0; i < nodeCount; i += 1) {
      const id = `node-${i + 1}`;
      const node = await NetworkNode.create(id, this.gossip, {
        fanoutSize: this.config.fanoutSize,
        broadcastSubsetSize1: this.config.broadcastSubsetSize1,
        broadcastSubsetSize2: this.config.broadcastSubsetSize2,
        useSubsets: this.config.useSubsets,
      });
      node.register();
      this.nodes.set(id, node);
    }

    for (const node of this.nodes.values()) {
      node.discoverNeighbors();
    }
  }

  public async addNode(): Promise<NodeInfo> {
    const id = `node-${this.nodes.size + 1}`;
    const node = await NetworkNode.create(id, this.gossip, {
      fanoutSize: this.config.fanoutSize,
      broadcastSubsetSize1: this.config.broadcastSubsetSize1,
      broadcastSubsetSize2: this.config.broadcastSubsetSize2,
      useSubsets: this.config.useSubsets,
    });
    node.register();
    this.nodes.set(id, node);
    node.discoverNeighbors();
    return this.toNodeInfo(node);
  }

  public listNodes(): NodeInfo[] {
    return Array.from(this.nodes.values()).map((node) => this.toNodeInfo(node));
  }

  public submitTransaction(
    from: string,
    to: string,
    amount: number,
  ): { txId: string; messageId: string } {
    const nodeIds = Array.from(this.nodes.keys());
    const randomNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const node = this.nodes.get(randomNodeId);
    if (!node) throw new Error("No nodes available");
    return node.submitTransaction(from, to, amount);
  }

  public async mine(
    nodeId: string,
    minerAddress: string,
  ): Promise<{
    nodeId: string;
    height: number;
    hash: string;
    pendingTxCount: number;
    messageId: string;
  }> {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    const result = await node.mine(minerAddress);
    return { nodeId, ...result };
  }

  public setDifficulty(nodeId: string, difficulty: number): void {
    const node = this.nodes.get(nodeId);
    if (node) node.setDifficulty(difficulty);
  }

  public setMaxTransactionsPerBlock(nodeId: string, limit: number): void {
    const node = this.nodes.get(nodeId);
    if (node) node.setMaxTransactionsPerBlock(limit);
  }

  public setGossipFanout(fanoutSize: number): void {
    this.gossip.setFanoutSize(fanoutSize);
  }

  public setPropagationDelay(ms: number): void {
    this.gossip.setPropagationDelay(ms);
    this.config.propagationDelayMs = ms;
  }

  public resetMetrics(): void {
    for (const node of this.nodes.values()) {
      node.resetMetrics();
    }
  }

  public getGossipMetrics() {
    return this.gossip.getMetrics();
  }

  public getState(): {
    nodeCount: number;
    nodes: NodeInfo[];
    maxHeight: number;
    avgPendingTxCount: number;
    propagationDelayMs: number;
    gossipMetrics: ReturnType<GossipProtocol["getMetrics"]>;
    networkTopology: {
      nodeId: string;
      neighborCount: number;
      neighbors: string[];
    }[];
  } {
    const nodes = this.listNodes();
    const maxHeight = nodes.reduce(
      (acc, node) => Math.max(acc, node.height),
      0,
    );
    const totalPending = nodes.reduce(
      (acc, node) => acc + node.pendingTxCount,
      0,
    );

    return {
      nodeCount: nodes.length,
      nodes,
      maxHeight,
      avgPendingTxCount: nodes.length === 0 ? 0 : totalPending / nodes.length,
      propagationDelayMs: this.config.propagationDelayMs,
      gossipMetrics: this.gossip.getMetrics(),
      networkTopology: this.gossip.getNetworkTopology(),
    };
  }

  public getNodeChain(nodeId: string): Block[] {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    return node.blockchain.chain;
  }

  public getNodeInfo(nodeId: string): NodeInfo {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    return this.toNodeInfo(node);
  }

  public getNodeMetrics(nodeId: string): NodeMetrics {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    return node.getMetrics();
  }

  public getNetworkTopology(): {
    nodeId: string;
    neighborCount: number;
    neighbors: string[];
  }[] {
    return this.gossip.getNetworkTopology();
  }

  public triggerNeighborDiscovery(): void {
    for (const node of this.nodes.values()) {
      node.discoverNeighbors();
    }
  }

  private toNodeInfo(node: NetworkNode): NodeInfo {
    const info = node.getInfo();
    const metrics = node.getMetrics();
    return {
      id: info.id,
      height: info.height,
      pendingTxCount: info.pendingTxCount,
      difficulty: info.difficulty,
      latestHash: info.latestHash,
      neighborCount: info.neighborCount,
      neighbors: info.neighbors,
      metrics,
    };
  }
}
