import numpy as np
import random
import time
from typing import List, Optional, Dict, Tuple, Callable
from dataclasses import dataclass
from node import Node
from block import Block

@dataclass
class Message:
    """Represents a message sent between nodes in the network."""
    sender_id: int
    receiver_id: int
    block: Block
    timestamp: float
    delivered: bool = False

class NetworkSimulator:
    """
    Simulates a P2P network with realistic conditions.
    
    Features:
    - Latency: Messages arrive with random delays
    - Packet loss: Some messages never arrive
    - Forks: Can force creation of competing chains
    """
    
    def __init__(
        self,
        num_nodes: int = 5,
        base_latency: float = 0.1,
        max_latency_variation: float = 0.5,
        drop_rate: float = 0.1,
        fork_probability: float = 0.15
    ):
        self.num_nodes = num_nodes
        self.nodes: Dict[int, Node] = {}
        self.messages: List[Message] = []
        self.message_queue: List[Tuple[float, Message]] = []  # (delivery_time, message)
        
        # Network parameters
        self.base_latency = base_latency
        self.max_latency_variation = max_latency_variation
        self.drop_rate = drop_rate
        self.fork_probability = fork_probability
        
        self.current_time = 0.0
        self.messages_sent = 0
        self.messages_dropped = 0
        self.forks_created = 0
        
        # Initialize nodes - one will be RL agent
        for i in range(num_nodes):
            is_rl = (i == 0)  # First node is the RL agent
            self.nodes[i] = Node(node_id=i, is_rl_agent=is_rl)
    
    def calculate_latency(self) -> float:
        """Calculate random latency for a message."""
        # Latency follows exponential distribution for realism
        variation = random.expovariate(1.0 / self.max_latency_variation)
        return self.base_latency + min(variation, self.max_latency_variation * 3)
    
    def should_drop_message(self) -> bool:
        """Determine if message should be dropped (simulates packet loss)."""
        return random.random() < self.drop_rate
    
    def should_create_fork(self) -> bool:
        """Determine if current conditions should trigger a fork."""
        return random.random() < self.fork_probability
    
    def broadcast_block(self, sender_id: int, block: Block, exclude: Optional[List[int]] = None):
        """
        Broadcast a block to all peers in the network.
        
        Simulates real network conditions:
        - Messages arrive at different times
        - Some messages may be lost
        """
        exclude = exclude or []
        
        for receiver_id in self.nodes.keys():
            if receiver_id != sender_id and receiver_id not in exclude:
                self.send_message(sender_id, receiver_id, block)
    
    def send_message(self, sender_id: int, receiver_id: int, block: Block):
        """Send a block from one node to another."""
        if self.should_drop_message():
            self.messages_dropped += 1
            return
        
        # Calculate delivery time based on latency
        latency = self.calculate_latency()
        delivery_time = self.current_time + latency
        
        message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            block=block,
            timestamp=self.current_time
        )
        
        # Queue message for delivery
        self.message_queue.append((delivery_time, message))
        self.messages_sent += 1
        
        # Sort by delivery time
        self.message_queue.sort(key=lambda x: x[0])
    
    def process_messages(self, max_time: Optional[float] = None) -> List[Message]:
        """
        Process all messages that should be delivered by current time.
        
        Returns list of delivered messages.
        """
        max_time = max_time or self.current_time
        delivered = []
        
        # Process messages that are due for delivery
        while self.message_queue and self.message_queue[0][0] <= max_time:
            delivery_time, message = self.message_queue.pop(0)
            message.delivered = True
            delivered.append(message)
            
            # Update receiver's state
            receiver = self.nodes[message.receiver_id]
            receiver.pending_blocks.append(message.block)
        
        return delivered
    
    def get_network_state(self, node_id: int) -> Dict:
        """Get current network state for a specific node."""
        node = self.nodes[node_id]
        pending_count = len(node.pending_blocks)
        
        return {
            'pending_blocks': pending_count,
            'messages_in_flight': len(self.message_queue),
            'current_time': self.current_time,
            'forks_detected': self.forks_created
        }
    
    def simulate_mining_round(self, miner_id: int) -> Block:
        """Simulate one round where a node mines a block."""
        miner = self.nodes[miner_id]
        data = f"Block mined by Node {miner_id} at t={self.current_time:.2f}"
        block = miner.propose_block(data)
        
        # Check if this creates a fork (miner has a different view of chain)
        if self.should_create_fork():
            self.forks_created += 1
            # Modify block slightly to simulate fork
            block.data += f" [FORK-{self.forks_created}]"
            block.hash = block._calculate_hash()
        
        return block
    
    def advance_time(self, delta: float = 0.1):
        """Advance simulation time."""
        self.current_time += delta
        self.process_messages()
    
    def reset(self):
        """Reset the network to initial state."""
        self.nodes.clear()
        self.messages.clear()
        self.message_queue.clear()
        self.current_time = 0.0
        self.messages_sent = 0
        self.messages_dropped = 0
        self.forks_created = 0
        
        for i in range(self.num_nodes):
            is_rl = (i == 0)
            self.nodes[i] = Node(node_id=i, is_rl_agent=is_rl)
    
    def get_statistics(self) -> Dict:
        """Get network simulation statistics."""
        return {
            'messages_sent': self.messages_sent,
            'messages_dropped': self.messages_dropped,
            'drop_rate_actual': self.messages_dropped / max(self.messages_sent, 1),
            'forks_created': self.forks_created,
            'simulation_time': self.current_time
        }
