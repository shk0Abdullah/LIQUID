import numpy as np
from typing import List, Optional, Dict, Tuple
from block import Block
import random

class Node:
    """
    Represents a blockchain node in the network.
    
    Each node maintains its own copy of the blockchain and can:
    - Propose new blocks
    - Receive and validate blocks from other nodes
    - Detect and handle forks
    
    The RL agent node will use Q-learning to make decisions.
    """
    
    def __init__(self, node_id: int, is_rl_agent: bool = False):
        self.node_id = node_id
        self.chain: List[Block] = [Block.genesis()]
        self.pending_blocks: List[Block] = []  # Blocks waiting to be processed
        self.peers: List['Node'] = []
        self.is_rl_agent = is_rl_agent
        self.confirmations: int = 0  # How many blocks deep current tip is
        self.fork_history: List[int] = []  # Track fork occurrences
        
    def get_latest_block(self) -> Block:
        """Get the most recent block in the chain."""
        return self.chain[-1]
    
    def get_chain_length(self) -> int:
        """Return the current length of the blockchain."""
        return len(self.chain)
    
    def propose_block(self, data: str) -> Block:
        """Create a new block to propose to the network."""
        latest = self.get_latest_block()
        new_block = Block(
            index=latest.index + 1,
            data=data,
            prev_hash=latest.hash
        )
        return new_block
    
    def validate_block(self, block: Block) -> bool:
        """Check if a block is valid and can be added to the chain."""
        latest = self.get_latest_block()
        
        # Check if block index is correct
        if block.index != latest.index + 1:
            return False
        
        # Check if previous hash matches
        if block.prev_hash != latest.hash:
            return False
        
        # Verify block hash
        if block.hash != block._calculate_hash():
            return False
        
        return True
    
    def add_block(self, block: Block) -> bool:
        """Add a valid block to the chain."""
        if self.validate_block(block):
            self.chain.append(block)
            self.confirmations += 1
            return True
        return False
    
    def detect_fork(self, block: Block) -> bool:
        """Detect if receiving this block would create a fork."""
        latest = self.get_latest_block()
        # Fork occurs when block doesn't reference our latest block
        return block.prev_hash != latest.hash and block.index == latest.index + 1
    
    def get_state_features(self) -> Tuple[int, int, float]:
        """
        Extract features for RL state representation.
        
        Returns:
            - number_of_confirmations: How deep current chain is
            - fork_length: Number of competing chains detected
            - peer_trust_score: Average reliability of peers (simplified)
        """
        fork_length = len([b for b in self.pending_blocks if self.detect_fork(b)])
        peer_trust = 0.8 + (random.random() * 0.2)  # Simulated trust score
        
        return (self.confirmations, fork_length, peer_trust)
    
    def get_chain_hashes(self) -> List[str]:
        """Get list of block hashes for comparison."""
        return [block.hash for block in self.chain]
    
    def __repr__(self):
        return f"Node({self.node_id}, RL={self.is_rl_agent}, len={len(self.chain)})"
