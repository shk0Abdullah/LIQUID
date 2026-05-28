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
  fanoutSize: number; // Number of random neighbors to pick for broadcast
  ttl: number; // Time-to-live for messages
  neighborDiscoveryInterval: number; // Interval to discover new neighbors
  maxNeighbors: number; // Maximum number of neighbors per node
}

export const DEFAULT_GOSSIP_CONFIG: GossipConfig = {
  fanoutSize: 2, // Send to 2 random neighbors
  ttl: 10,
  neighborDiscoveryInterval: 30000,
  maxNeighbors: 5,
};

export class GossipProtocol {
  private nodes = new Map<string, GossipNode>();
  private config: GossipConfig;
  private messageCallbacks = new Map<
    string,
    (message: NetworkMessage) => void
  >();

  constructor(config: Partial<GossipConfig> = {}) {
    this.config = { ...DEFAULT_GOSSIP_CONFIG, ...config };
  }

  // Register a node in the network
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

  // Remove a node from the network
  public unregisterNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove this node from all other nodes' neighbor lists
    for (const otherNode of this.nodes.values()) {
      otherNode.neighbors.delete(nodeId);
    }

    this.nodes.delete(nodeId);
  }

  // Get all nodes in the network
  public getAllNodes(): GossipNode[] {
    return Array.from(this.nodes.values());
  }

  // Get node by ID
  public getNode(nodeId: string): GossipNode | undefined {
    return this.nodes.get(nodeId);
  }

  // Assign initial neighbors to a node
  private assignInitialNeighbors(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const otherNodeIds = Array.from(this.nodes.keys()).filter(
      (id) => id !== nodeId,
    );

    // Pick random neighbors up to maxNeighbors
    const numNeighborsToAdd = Math.min(
      this.config.maxNeighbors,
      otherNodeIds.length,
    );
    const shuffled = this.shuffleArray(otherNodeIds);

    for (let i = 0; i < numNeighborsToAdd; i++) {
      const neighborId = shuffled[i];
      node.neighbors.add(neighborId);

      // Bidirectional connection
      const neighborNode = this.nodes.get(neighborId);
      if (
        neighborNode &&
        neighborNode.neighbors.size < this.config.maxNeighbors
      ) {
        neighborNode.neighbors.add(nodeId);
      }
    }
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get random subset of neighbors (fanout)
  private getRandomNeighbors(nodeId: string, count: number): string[] {
    const node = this.nodes.get(nodeId);
    if (!node || node.neighbors.size === 0) return [];

    const neighbors = Array.from(node.neighbors);
    const shuffled = this.shuffleArray(neighbors);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Broadcast message using gossip protocol
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

    // Mark as received by sender
    const senderNode = this.nodes.get(senderId);
    if (senderNode) {
      senderNode.receivedMessages.add(message.id);
    }

    // Get two subsets of random neighbors
    const fanout = this.config.fanoutSize;
    const selectedNeighbors = this.getRandomNeighbors(senderId, fanout);

    // Send to selected neighbors
    for (const neighborId of selectedNeighbors) {
      this.sendMessage(neighborId, message);
    }

    return message.id;
  }

  // Broadcast to specific subset sizes (two subsets)
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

    // Mark as received by sender
    const senderNode = this.nodes.get(senderId);
    if (senderNode) {
      senderNode.receivedMessages.add(message.id);
    }

    // Get all neighbors
    const node = this.nodes.get(senderId);
    if (!node || node.neighbors.size === 0) return message.id;

    const neighbors = Array.from(node.neighbors);
    const shuffled = this.shuffleArray(neighbors);

    // Split into two subsets
    const subset1 = shuffled.slice(0, Math.min(subsetSize1, shuffled.length));
    const remaining = shuffled.slice(subsetSize1);
    const subset2 = remaining.slice(0, Math.min(subsetSize2, remaining.length));

    // Send to subset 1
    for (const neighborId of subset1) {
      this.sendMessage(neighborId, message);
    }

    // Send to subset 2
    for (const neighborId of subset2) {
      this.sendMessage(neighborId, message);
    }

    return message.id;
  }

  // Send message to specific node
  private sendMessage(targetId: string, message: NetworkMessage): void {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    // Check if already received
    if (targetNode.receivedMessages.has(message.id)) return;

    // Mark as received
    targetNode.receivedMessages.add(message.id);

    // Trigger callback if set
    if (targetNode.onMessageReceived) {
      targetNode.onMessageReceived(message);
    }

    // Forward to other neighbors (gossip propagation)
    if (message.ttl > 1) {
      const forwardMessage = { ...message, ttl: message.ttl - 1 };
      const selectedNeighbors = this.getRandomNeighbors(
        targetId,
        this.config.fanoutSize,
      );

      for (const neighborId of selectedNeighbors) {
        // Don't send back to sender
        if (neighborId !== message.senderId) {
          this.forwardMessage(neighborId, forwardMessage);
        }
      }
    }
  }

  // Forward message without triggering callback (for propagation)
  private forwardMessage(targetId: string, message: NetworkMessage): void {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    // Check if already received
    if (targetNode.receivedMessages.has(message.id)) return;

    // Mark as received
    targetNode.receivedMessages.add(message.id);

    // Trigger callback if set
    if (targetNode.onMessageReceived) {
      targetNode.onMessageReceived(message);
    }

    // Continue forwarding if TTL allows
    if (message.ttl > 1) {
      const forwardMessage = { ...message, ttl: message.ttl - 1 };
      const selectedNeighbors = this.getRandomNeighbors(
        targetId,
        this.config.fanoutSize,
      );

      for (const neighborId of selectedNeighbors) {
        if (neighborId !== message.senderId && neighborId !== targetId) {
          this.forwardMessage(neighborId, forwardMessage);
        }
      }
    }
  }

  // Broadcast transaction using gossip
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

  // Broadcast block using gossip
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

  // Discover new neighbors for a node
  public discoverNeighbors(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const allNodeIds = Array.from(this.nodes.keys()).filter(
      (id) => id !== nodeId,
    );
    const currentNeighbors = Array.from(node.neighbors);

    // Find nodes that aren't neighbors yet
    const nonNeighbors = allNodeIds.filter(
      (id) => !currentNeighbors.includes(id),
    );

    if (nonNeighbors.length === 0) return;

    // Add new random neighbor if under limit
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

  // Get network topology info
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

  // Clear all nodes and messages
  public reset(): void {
    this.nodes.clear();
    this.messageCallbacks.clear();
  }
}
