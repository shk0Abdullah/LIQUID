export { GossipProtocol, DEFAULT_GOSSIP_CONFIG } from "./gossip.js";
export type { GossipNode, GossipConfig } from "./gossip.js";
export { NetworkNode, DEFAULT_NETWORK_NODE_CONFIG } from "./node.js";
export type { NetworkNodeConfig } from "./node.js";
export { createMessageId, createNetworkMessage } from "./message.js";
export type {
  NetworkMessage,
  MessageType,
  TransactionPayload,
  BlockPayload,
  GossipPayload,
  NeighborsRequestPayload,
  NeighborsResponsePayload,
} from "./message.js";
