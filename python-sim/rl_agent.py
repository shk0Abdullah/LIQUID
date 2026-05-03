import numpy as np
import random
from typing import Dict, Tuple, List, Optional
import json

class QLearningAgent:
    """
    Q-Learning agent for adaptive blockchain consensus.
    
    The agent learns optimal actions (accept, reject, wait) based on
    network state to minimize forks and maximize consensus speed.
    
    State representation:
    - confirmations: Number of blocks deep (discretized)
    - fork_length: Number of competing chains (discretized)
    - peer_trust: Average peer reliability (discretized)
    
    Actions:
    - 0: "accept" - Add block to chain immediately
    - 1: "reject" - Discard the block
    - 2: "wait" - Delay decision, gather more info
    
    Reward structure:
    - +10: Correct consensus reached
    - -5: Fork detected
    - -2: Excessive delay
    """
    
    def __init__(
        self,
        learning_rate: float = 0.1,
        discount_factor: float = 0.9,
        exploration_rate: float = 0.3,
        exploration_decay: float = 0.995,
        min_exploration: float = 0.01
    ):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.exploration_rate = exploration_rate
        self.exploration_decay = exploration_decay
        self.min_exploration = min_exploration
        
        # Q-table: maps state tuple to action values
        # State: (confirmations_bucket, fork_length_bucket, trust_bucket)
        # Action values: [accept_value, reject_value, wait_value]
        self.q_table: Dict[Tuple, np.ndarray] = {}
        
        # Action mapping
        self.actions = ["accept", "reject", "wait"]
        self.action_ids = {a: i for i, a in enumerate(self.actions)}
        
        # Training metrics
        self.episode_rewards: List[float] = []
        self.episode_lengths: List[int] = []
        
    def discretize_state(self, confirmations: int, fork_length: int, peer_trust: float) -> Tuple[int, int, int]:
        """
        Convert continuous state into discrete buckets for Q-table.
        
        Bucket sizes:
        - confirmations: 0-2, 3-5, 6-10, 10+ (4 buckets)
        - fork_length: 0, 1, 2, 3+ (4 buckets)
        - peer_trust: 0-0.6, 0.6-0.8, 0.8-0.9, 0.9-1.0 (4 buckets)
        """
        # Discretize confirmations
        if confirmations <= 2:
            conf_bucket = 0
        elif confirmations <= 5:
            conf_bucket = 1
        elif confirmations <= 10:
            conf_bucket = 2
        else:
            conf_bucket = 3
        
        # Discretize fork_length
        fork_bucket = min(fork_length, 3)
        
        # Discretize trust
        if peer_trust < 0.6:
            trust_bucket = 0
        elif peer_trust < 0.8:
            trust_bucket = 1
        elif peer_trust < 0.9:
            trust_bucket = 2
        else:
            trust_bucket = 3
        
        return (conf_bucket, fork_bucket, trust_bucket)
    
    def get_action_values(self, state: Tuple[int, int, int]) -> np.ndarray:
        """Get Q-values for all actions in a state."""
        if state not in self.q_table:
            # Initialize with small random values to break symmetry
            self.q_table[state] = np.random.uniform(-0.1, 0.1, size=3)
        return self.q_table[state]
    
    def choose_action(self, confirmations: int, fork_length: int, peer_trust: float) -> str:
        """
        Choose action using epsilon-greedy policy.
        
        With probability epsilon: explore (random action)
        Otherwise: exploit (best known action)
        """
        state = self.discretize_state(confirmations, fork_length, peer_trust)
        
        if random.random() < self.exploration_rate:
            # Exploration: random action
            return random.choice(self.actions)
        else:
            # Exploitation: best action
            action_values = self.get_action_values(state)
            best_action = np.argmax(action_values)
            return self.actions[best_action]
    
    def update(
        self,
        confirmations: int,
        fork_length: int,
        peer_trust: float,
        action: str,
        reward: float,
        next_confirmations: int,
        next_fork_length: int,
        next_trust: float,
        done: bool = False
    ):
        """
        Update Q-value using Bellman equation.
        
        Q(s,a) = Q(s,a) + α * [r + γ * max(Q(s',a')) - Q(s,a)]
        
        where:
        - α (alpha): learning rate
        - γ (gamma): discount factor
        - r: immediate reward
        - s': next state
        """
        state = self.discretize_state(confirmations, fork_length, peer_trust)
        next_state = self.discretize_state(next_confirmations, next_fork_length, next_trust)
        action_id = self.action_ids[action]
        
        # Current Q-value
        current_q = self.get_action_values(state)[action_id]
        
        # Calculate target Q-value
        if done:
            # Terminal state: no future rewards
            target = reward
        else:
            # Non-terminal: include discounted future rewards
            next_values = self.get_action_values(next_state)
            target = reward + self.discount_factor * np.max(next_values)
        
        # Update Q-value
        new_q = current_q + self.learning_rate * (target - current_q)
        self.q_table[state][action_id] = new_q
    
    def decay_exploration(self):
        """Reduce exploration rate over time to favor exploitation."""
        self.exploration_rate = max(
            self.min_exploration,
            self.exploration_rate * self.exploration_decay
        )
    
    def calculate_reward(
        self,
        action: str,
        consensus_reached: bool,
        fork_occurred: bool,
        delay: float,
        max_acceptable_delay: float = 2.0
    ) -> float:
        """
        Calculate reward based on action outcome.
        
        Reward structure:
        - Correct consensus: +10
        - Fork detected: -5
        - Excessive delay: -2
        - Reject good block: -1
        - Accept bad block: -10
        """
        reward = 0.0
        
        if consensus_reached:
            reward += 10.0
        
        if fork_occurred:
            reward -= 5.0
        
        if delay > max_acceptable_delay:
            reward -= 2.0 * (delay / max_acceptable_delay)
        
        return reward
    
    def get_policy(self) -> Dict:
        """Extract current policy from Q-table for inspection."""
        policy = {}
        for state, values in self.q_table.items():
            best_action = self.actions[np.argmax(values)]
            policy[str(state)] = {
                'best_action': best_action,
                'q_values': values.tolist()
            }
        return policy
    
    def save_q_table(self, filename: str):
        """Save Q-table to file for persistence."""
        data = {
            'q_table': {str(k): v.tolist() for k, v in self.q_table.items()},
            'exploration_rate': self.exploration_rate
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    
    def load_q_table(self, filename: str):
        """Load Q-table from file."""
        with open(filename, 'r') as f:
            data = json.load(f)
        
        self.q_table = {
            tuple(int(x) for x in k.strip('()').split(', ')): np.array(v)
            for k, v in data['q_table'].items()
        }
        self.exploration_rate = data['exploration_rate']
    
    def __repr__(self):
        return f"QLearningAgent(states={len(self.q_table)}, ε={self.exploration_rate:.3f})"
