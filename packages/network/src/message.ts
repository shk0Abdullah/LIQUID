export type MessageType =
  | "TRANSACTION"
  | "BLOCK"
  | "GOSSIP"
  | "NEIGHBORS_REQUEST"
  | "NEIGHBORS_RESPONSE";

export interface NetworkMessage {
  id: string;
  type: MessageType;
  senderId: string;
  timestamp: number;
  ttl: number;
  payload: unknown;
}

export interface TransactionPayload {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export interface BlockPayload {
  index: number;
  timestamp: number;
  transactions: TransactionPayload[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface GossipPayload {
  messageIds: string[];
}

export interface NeighborsRequestPayload {
  requesterId: string;
  knownNodes: string[];
}

export interface NeighborsResponsePayload {
  suggestedNeighbors: string[];
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createNetworkMessage(
  type: MessageType,
  senderId: string,
  payload: unknown,
  ttl = 10,
): NetworkMessage {
  return {
    id: createMessageId(),
    type,
    senderId,
    timestamp: Date.now(),
    ttl,
    payload,
  };
}
