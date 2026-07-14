import {
  NetworkMessage,
  MessageType,
  createNetworkMessage,
  TransactionPayload,
  BlockPayload,
} from "./message.js";

export interface GossipNode {
  id: string;
  neighbors: Set<string>;
  receivedMessages: Set<string>;
  onMessageReceived?: (message: NetworkMessage) => void;
}

export interface GossipConfig {
  fanoutSize: number;
  ttl: number;
  neighborDiscoveryInterval: number;
  maxNeighbors: number;
  propagationDelayMs: number;
}

export interface GossipMetrics {
  messagesSent: number;
  messagesDeduped: number;
  messagesDelivered: number;
  averageHops: number;
  totalHops: number;
  deliveriesTracked: number;
}

export const DEFAULT_GOSSIP_CONFIG: GossipConfig = {
  fanoutSize: 2,
  ttl: 10,
  neighborDiscoveryInterval: 30000,
  maxNeighbors: 5,
  propagationDelayMs: 0,
};

export class GossipProtocol {
  private nodes = new Map<string, GossipNode>();
  private config: GossipConfig;
  private metrics: GossipMetrics = {
    messagesSent: 0,
    messagesDeduped: 0,
    messagesDelivered: 0,
    averageHops: 0,
    totalHops: 0,
    deliveriesTracked: 0,
  };
  private messageHops = new Map<string, number>();

  constructor(config: Partial<GossipConfig> = {}) {
    this.config = { ...DEFAULT_GOSSIP_CONFIG, ...config };
  }

  public registerNode(
    nodeId: string,
    onMessageReceived?: (message: NetworkMessage) => void,
  ): GossipNode {
    const node: GossipNode = {
      id: nodeId,
      neighbors: new Set(),
      receivedMessages: new Set(),
      onMessageReceived,
    };
    this.nodes.set(nodeId, node);
    this.assignInitialNeighbors(nodeId);
    return node;
  }

  public unregisterNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    for (const otherNode of this.nodes.values()) {
      otherNode.neighbors.delete(nodeId);
    }
    this.nodes.delete(nodeId);
  }

  public getAllNodes(): GossipNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(nodeId: string): GossipNode | undefined {
    return this.nodes.get(nodeId);
  }

  private assignInitialNeighbors(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const otherNodeIds = Array.from(this.nodes.keys()).filter(
      (id) => id !== nodeId,
    );

    const numNeighborsToAdd = Math.min(
      this.config.maxNeighbors,
      otherNodeIds.length,
    );
    const shuffled = this.shuffleArray(otherNodeIds);

    for (let i = 0; i < numNeighborsToAdd; i++) {
      const neighborId = shuffled[i];
      node.neighbors.add(neighborId);
      const neighborNode = this.nodes.get(neighborId);
      if (
        neighborNode &&
        neighborNode.neighbors.size < this.config.maxNeighbors
      ) {
        neighborNode.neighbors.add(nodeId);
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRandomNeighbors(nodeId: string, count: number): string[] {
    const node = this.nodes.get(nodeId);
    if (!node || node.neighbors.size === 0) return [];
    const neighbors = Array.from(node.neighbors);
    const shuffled = this.shuffleArray(neighbors);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private scheduleDelivery(
    targetId: string,
    message: NetworkMessage,
    hop: number,
  ): void {
    const deliver = () => {
      const targetNode = this.nodes.get(targetId);
      if (!targetNode) return;

      if (targetNode.receivedMessages.has(message.id)) {
        this.metrics.messagesDeduped++;
        return;
      }

      targetNode.receivedMessages.add(message.id);
      this.metrics.messagesDelivered++;

      this.messageHops.set(message.id, hop);
      this.metrics.totalHops += hop;
      this.metrics.deliveriesTracked++;
      this.metrics.averageHops =
        this.metrics.totalHops / this.metrics.deliveriesTracked;

      if (targetNode.onMessageReceived) {
        targetNode.onMessageReceived(message);
      }

      if (message.ttl > 1) {
        const forwardMessage = { ...message, ttl: message.ttl - 1 };
        const selectedNeighbors = this.getRandomNeighbors(
          targetId,
          this.config.fanoutSize,
        );
        for (const neighborId of selectedNeighbors) {
          if (neighborId !== message.senderId) {
            this.metrics.messagesSent++;
            this.scheduleDelivery(neighborId, forwardMessage, hop + 1);
          }
        }
      }
    };

    if (this.config.propagationDelayMs > 0) {
      setTimeout(deliver, this.config.propagationDelayMs);
    } else {
      deliver();
    }
  }

  public broadcast(
    senderId: string,
    type: MessageType,
    payload: unknown,
    ttl?: number,
  ): string {
    const message = createNetworkMessage(
      type,
      senderId,
      payload,
      ttl ?? this.config.ttl,
    );

    const senderNode = this.nodes.get(senderId);
    if (senderNode) {
      senderNode.receivedMessages.add(message.id);
    }

    const fanout = this.config.fanoutSize;
    const selectedNeighbors = this.getRandomNeighbors(senderId, fanout);

    for (const neighborId of selectedNeighbors) {
      this.metrics.messagesSent++;
      this.scheduleDelivery(neighborId, message, 1);
    }

    return message.id;
  }

  public broadcastWithSubsets(
    senderId: string,
    type: MessageType,
    payload: unknown,
    subsetSize1: number,
    subsetSize2: number,
    ttl?: number,
  ): string {
    const message = createNetworkMessage(
      type,
      senderId,
      payload,
      ttl ?? this.config.ttl,
    );

    const senderNode = this.nodes.get(senderId);
    if (senderNode) {
      senderNode.receivedMessages.add(message.id);
    }

    const node = this.nodes.get(senderId);
    if (!node || node.neighbors.size === 0) return message.id;

    const neighbors = Array.from(node.neighbors);
    const shuffled = this.shuffleArray(neighbors);
    const subset1 = shuffled.slice(0, Math.min(subsetSize1, shuffled.length));
    const remaining = shuffled.slice(subsetSize1);
    const subset2 = remaining.slice(0, Math.min(subsetSize2, remaining.length));

    for (const neighborId of subset1) {
      this.metrics.messagesSent++;
      this.scheduleDelivery(neighborId, message, 1);
    }
    for (const neighborId of subset2) {
      this.metrics.messagesSent++;
      this.scheduleDelivery(neighborId, message, 1);
    }

    return message.id;
  }

  public broadcastTransaction(
    senderId: string,
    transaction: TransactionPayload,
    useSubsets = false,
    subsetSize1 = 2,
    subsetSize2 = 2,
  ): string {
    if (useSubsets) {
      return this.broadcastWithSubsets(
        senderId,
        "TRANSACTION",
        transaction,
        subsetSize1,
        subsetSize2,
      );
    }
    return this.broadcast(senderId, "TRANSACTION", transaction);
  }

  public broadcastBlock(
    senderId: string,
    block: BlockPayload,
    useSubsets = false,
    subsetSize1 = 2,
    subsetSize2 = 2,
  ): string {
    if (useSubsets) {
      return this.broadcastWithSubsets(
        senderId,
        "BLOCK",
        block,
        subsetSize1,
        subsetSize2,
      );
    }
    return this.broadcast(senderId, "BLOCK", block);
  }

  public discoverNeighbors(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const allNodeIds = Array.from(this.nodes.keys()).filter(
      (id) => id !== nodeId,
    );
    const currentNeighbors = Array.from(node.neighbors);
    const nonNeighbors = allNodeIds.filter(
      (id) => !currentNeighbors.includes(id),
    );

    if (nonNeighbors.length === 0) return;

    if (node.neighbors.size < this.config.maxNeighbors) {
      const newNeighbor =
        nonNeighbors[Math.floor(Math.random() * nonNeighbors.length)];
      node.neighbors.add(newNeighbor);
      const neighborNode = this.nodes.get(newNeighbor);
      if (
        neighborNode &&
        neighborNode.neighbors.size < this.config.maxNeighbors
      ) {
        neighborNode.neighbors.add(nodeId);
      }
    }
  }

  public setFanoutSize(fanoutSize: number): void {
    if (!Number.isInteger(fanoutSize) || fanoutSize < 1) {
      throw new Error("Fanout size must be an integer >= 1");
    }
    this.config.fanoutSize = fanoutSize;
  }

  public setPropagationDelay(ms: number): void {
    this.config.propagationDelayMs = Math.max(0, ms);
  }

  public getMetrics(): GossipMetrics {
    return { ...this.metrics };
  }

  public getNetworkTopology(): {
    nodeId: string;
    neighborCount: number;
    neighbors: string[];
  }[] {
    return Array.from(this.nodes.entries()).map(([id, node]) => ({
      nodeId: id,
      neighborCount: node.neighbors.size,
      neighbors: Array.from(node.neighbors),
    }));
  }

  public reset(): void {
    this.nodes.clear();
    this.metrics = {
      messagesSent: 0,
      messagesDeduped: 0,
      messagesDelivered: 0,
      averageHops: 0,
      totalHops: 0,
      deliveriesTracked: 0,
    };
    this.messageHops.clear();
  }
}
