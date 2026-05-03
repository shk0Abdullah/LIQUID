import numpy as np
import random
from typing import Tuple, Dict, List, Optional
from network import NetworkSimulator
from rl_agent import QLearningAgent
from block import Block

class BlockchainEnvironment:
    """
    Reinforcement Learning environment for blockchain consensus.
    
    This environment wraps the network simulation and provides
    a clean interface for RL training. It handles:
    - Episode initialization
    - State observation
    - Action execution
    - Reward calculation
    - Episode termination
    """
    
    def __init__(
        self,
        num_nodes: int = 5,
        max_steps_per_episode: int = 100,
        target_consensus: int = 10
    ):
        self.num_nodes = num_nodes
        self.max_steps = max_steps_per_episode
        self.target_consensus = target_consensus
        
        # Create network simulator
        self.network = NetworkSimulator(
            num_nodes=num_nodes,
            base_latency=0.05,
            max_latency_variation=0.3,
            drop_rate=0.1,
            fork_probability=0.15
        )
        
        # RL Agent (Node 0)
        self.agent = QLearningAgent(
            learning_rate=0.15,
            discount_factor=0.95,
            exploration_rate=0.4,
            exploration_decay=0.99
        )
        
        # Episode tracking
        self.current_step = 0
        self.episode_start_time = 0.0
        self.consensus_reached = False
        self.forks_in_episode = 0
        self.delays_in_episode = 0
        self.total_delay = 0.0
        
        # Metrics
        self.metrics = {
            'consensus_times': [],
            'fork_counts': [],
            'accuracies': [],
            'rewards': []
        }
    
    def reset(self) -> Tuple[int, int, float]:
        """
        Reset environment for new episode.
        
        Returns initial state (confirmations, fork_length, peer_trust).
        """
        self.network.reset()
        self.current_step = 0
        self.episode_start_time = 0.0
        self.consensus_reached = False
        self.forks_in_episode = 0
        self.delays_in_episode = 0
        self.total_delay = 0.0
        
        # Get RL agent node
        rl_node = self.network.nodes[0]
        state = rl_node.get_state_features()
        
        return state
    
    def step(self, action: str) -> Tuple[Tuple, float, bool, Dict]:
        """
        Execute one step in the environment.
        
        Args:
            action: One of "accept", "reject", "wait"
        
        Returns:
            - next_state: Tuple of (confirmations, fork_length, peer_trust)
            - reward: Float reward value
            - done: Boolean indicating episode end
            - info: Dictionary with additional info
        """
        self.current_step += 1
        
        # Get current state
        rl_node = self.network.nodes[0]
        current_state = rl_node.get_state_features()
        confirmations, fork_length, peer_trust = current_state
        
        # Process pending messages
        messages = self.network.process_messages()
        
        # Track if a fork occurred this step
        fork_occurred = False
        for msg in messages:
            if rl_node.detect_fork(msg.block):
                fork_occurred = True
                self.forks_in_episode += 1
        
        # Execute action
        consensus_this_step = False
        delay = 0.0
        
        if action == "accept":
            # Accept first pending block if any
            if rl_node.pending_blocks:
                block = rl_node.pending_blocks.pop(0)
                if rl_node.validate_block(block):
                    rl_node.add_block(block)
                    consensus_this_step = True
            else:
                # Accept but no block - small penalty
                delay = 0.1
                
        elif action == "reject":
            # Clear pending blocks (reject all)
            if rl_node.pending_blocks:
                rl_node.pending_blocks.clear()
            else:
                # Reject but no block - small penalty
                delay = 0.1
                
        elif action == "wait":
            # Wait accumulates delay
            delay = 0.2
            self.delays_in_episode += 1
            self.total_delay += delay
        
        # Simulate other nodes mining and broadcasting
        for node_id in range(1, self.num_nodes):
            if random.random() < 0.3:  # 30% chance to mine each step
                block = self.network.simulate_mining_round(node_id)
                self.network.broadcast_block(node_id, block)
        
        # Advance time
        self.network.advance_time(0.1)
        
        # Get next state
        next_state = rl_node.get_state_features()
        next_confirmations = rl_node.get_chain_length() - 1  # Excluding genesis
        
        # Calculate reward
        reward = self._calculate_reward(
            action=action,
            consensus_reached=consensus_this_step,
            fork_occurred=fork_occurred,
            delay=delay
        )
        
        # Check if episode done
        done = self._is_episode_done(next_confirmations)
        
        # Update consensus tracking
        if next_confirmations >= self.target_consensus:
            self.consensus_reached = True
        
        info = {
            'action': action,
            'consensus_reached': self.consensus_reached,
            'forks': self.forks_in_episode,
            'chain_length': rl_node.get_chain_length(),
            'confirmations': next_confirmations
        }
        
        return next_state, reward, done, info
    
    def _calculate_reward(
        self,
        action: str,
        consensus_reached: bool,
        fork_occurred: bool,
        delay: float
    ) -> float:
        """Calculate reward for the current step."""
        reward = 0.0
        
        if consensus_reached:
            reward += 10.0
        
        if fork_occurred:
            reward -= 5.0
        
        if delay > 0:
            reward -= 2.0
        
        # Penalize reject when no fork
        if action == "reject" and not fork_occurred:
            reward -= 1.0
        
        # Penalize excessive waiting
        if action == "wait" and self.delays_in_episode > 5:
            reward -= 1.0
        
        return reward
    
    def _is_episode_done(self, confirmations: int) -> bool:
        """Check if episode should terminate."""
        if confirmations >= self.target_consensus:
            return True
        if self.current_step >= self.max_steps:
            return True
        return False
    
    def get_metrics(self) -> Dict:
        """Get current episode metrics."""
        rl_node = self.network.nodes[0]
        return {
            'consensus_time': self.network.current_time,
            'fork_count': self.forks_in_episode,
            'accuracy': self._calculate_accuracy(),
            'chain_length': rl_node.get_chain_length(),
            'steps': self.current_step
        }
    
    def _calculate_accuracy(self) -> float:
        """
        Calculate consensus accuracy.
        
        Accuracy is based on:
        - Whether target consensus was reached
        - Number of forks (fewer is better)
        - Efficiency (fewer steps is better)
        """
        if not self.consensus_reached:
            return 0.0
        
        # Base accuracy from reaching consensus
        base_acc = 1.0
        
        # Penalty for forks
        fork_penalty = min(self.forks_in_episode * 0.1, 0.5)
        
        # Penalty for inefficiency
        efficiency_penalty = min(self.current_step / self.max_steps * 0.2, 0.2)
        
        accuracy = base_acc - fork_penalty - efficiency_penalty
        return max(0.0, accuracy)
    
    def record_episode_metrics(self):
        """Record metrics for completed episode."""
        metrics = self.get_metrics()
        self.metrics['consensus_times'].append(metrics['consensus_time'])
        self.metrics['fork_counts'].append(metrics['fork_count'])
        self.metrics['accuracies'].append(metrics['accuracy'])
