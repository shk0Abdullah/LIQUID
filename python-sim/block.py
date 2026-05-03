import hashlib
import time
from typing import Optional, List

class Block:
    """
    Represents a block in the blockchain.
    
    Each block contains:
    - index: Position in the chain
    - timestamp: When the block was created
    - data: Block content/transactions
    - prev_hash: Hash of the previous block
    - hash: Unique identifier for this block
    """
    
    def __init__(self, index: int, data: str, prev_hash: str, timestamp: Optional[float] = None):
        self.index = index
        self.timestamp = timestamp or time.time()
        self.data = data
        self.prev_hash = prev_hash
        self.hash = self._calculate_hash()
        
    def _calculate_hash(self) -> str:
        """Generate SHA-256 hash of block contents."""
        block_string = f"{self.index}{self.timestamp}{self.data}{self.prev_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> dict:
        """Convert block to dictionary for serialization."""
        return {
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'prev_hash': self.prev_hash,
            'hash': self.hash
        }
    
    @staticmethod
    def genesis() -> 'Block':
        """Create the genesis (first) block."""
        return Block(0, "Genesis Block", "0")
    
    def __repr__(self):
        return f"Block({self.index}, hash={self.hash[:8]}...)"
