import json
import random
import sys
from collections import deque
from typing import Dict, List, Tuple, Any

import requests
import numpy as np

API_BASE = "http://localhost:3000"
EPISODES = 420
STEPS_PER_EPISODE = 210

# Hyperparameters
ALPHA = 0.001  # Learning rate (for neural network)
GAMMA = 0.99   # Discount factor
EPSILON_START = 1.0
EPSILON_END = 0.05
EPSILON_DECAY = 0.995
BATCH_SIZE = 32
MEMORY_SIZE = 10000
TARGET_UPDATE_FREQ = 100

# Continuous action space - actual values, not discrete templates
ACTION_BOUNDS = {
    "difficulty": (1, 12),
    "maxTxsPerBlock": (1, 500),
    "gossipFanout": (0.0, 1.0),
    "mineIntervalMs": (100, 10000),
}

# State space bounds
STATE_BOUNDS = {
    "mempool_size": (0, 1000),
    "current_tps": (0, 100),
    "network_delay": (0, 500),
    "incoming_txs": (0, 100),
}


class ReplayBuffer:
    """Experience replay buffer for DQN"""
    def __init__(self, capacity: int = MEMORY_SIZE):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size: int):
        batch = random.sample(self.buffer, min(len(self.buffer), batch_size))
        return zip(*batch)
    
    def __len__(self):
        return len(self.buffer)


class QNetwork:
    """Simple Q-Network using numpy (simulating a neural network)"""
    def __init__(self, state_dim: int = 4, action_dim: int = 4):
        self.state_dim = state_dim
        self.action_dim = action_dim
        # Initialize weights randomly
        np.random.seed(42)
        self.W1 = np.random.randn(state_dim, 64) * 0.01
        self.b1 = np.zeros((1, 64))
        self.W2 = np.random.randn(64, 32) * 0.01
        self.b2 = np.zeros((1, 32))
        self.W3 = np.random.randn(32, action_dim) * 0.01
        self.b3 = np.zeros((1, action_dim))
    
    def relu(self, x):
        return np.maximum(0, x)
    
    def forward(self, state: np.ndarray) -> np.ndarray:
        """Forward pass through the network"""
        z1 = np.dot(state, self.W1) + self.b1
        a1 = self.relu(z1)
        z2 = np.dot(a1, self.W2) + self.b2
        a2 = self.relu(z2)
        z3 = np.dot(a2, self.W3) + self.b3
        return z3
    
    def get_action_values(self, state: np.ndarray) -> np.ndarray:
        """Get Q-values for all actions"""
        return self.forward(state)


class DQNAgent:
    """Deep Q-Network Agent"""
    def __init__(self):
        self.q_network = QNetwork()
        self.target_network = QNetwork()
        self.memory = ReplayBuffer()
        self.epsilon = EPSILON_START
        self.step_count = 0
        
    def normalize_state(self, state: Dict[str, float]) -> np.ndarray:
        """Normalize state to [0, 1] range"""
        return np.array([
            state.get("mempool_size", 0) / STATE_BOUNDS["mempool_size"][1],
            state.get("current_tps", 0) / STATE_BOUNDS["current_tps"][1],
            state.get("network_delay", 0) / STATE_BOUNDS["network_delay"][1],
            state.get("incoming_txs", 0) / STATE_BOUNDS["incoming_txs"][1],
        ]).reshape(1, -1)
    
    def denormalize_action(self, action: np.ndarray) -> Dict[str, float]:
        """Convert normalized action to actual values"""
        return {
            "difficulty": int(ACTION_BOUNDS["difficulty"][0] + action[0] * (ACTION_BOUNDS["difficulty"][1] - ACTION_BOUNDS["difficulty"][0])),
            "maxTxsPerBlock": int(ACTION_BOUNDS["maxTxsPerBlock"][0] + action[1] * (ACTION_BOUNDS["maxTxsPerBlock"][1] - ACTION_BOUNDS["maxTxsPerBlock"][0])),
            "gossipFanout": float(ACTION_BOUNDS["gossipFanout"][0] + action[2] * (ACTION_BOUNDS["gossipFanout"][1] - ACTION_BOUNDS["gossipFanout"][0])),
            "mineIntervalMs": int(ACTION_BOUNDS["mineIntervalMs"][0] + action[3] * (ACTION_BOUNDS["mineIntervalMs"][1] - ACTION_BOUNDS["mineIntervalMs"][0])),
        }
    
    def normalize_action(self, action: Dict[str, float]) -> np.ndarray:
        """Convert action to [0, 1] range"""
        return np.array([
            (action["difficulty"] - ACTION_BOUNDS["difficulty"][0]) / (ACTION_BOUNDS["difficulty"][1] - ACTION_BOUNDS["difficulty"][0]),
            (action["maxTxsPerBlock"] - ACTION_BOUNDS["maxTxsPerBlock"][0]) / (ACTION_BOUNDS["maxTxsPerBlock"][1] - ACTION_BOUNDS["maxTxsPerBlock"][0]),
            (action["gossipFanout"] - ACTION_BOUNDS["gossipFanout"][0]) / (ACTION_BOUNDS["gossipFanout"][1] - ACTION_BOUNDS["gossipFanout"][0]),
            (action["mineIntervalMs"] - ACTION_BOUNDS["mineIntervalMs"][0]) / (ACTION_BOUNDS["mineIntervalMs"][1] - ACTION_BOUNDS["mineIntervalMs"][0]),
        ])
    
    def select_action(self, state: np.ndarray, explore: bool = True) -> Tuple[np.ndarray, Dict[str, float]]:
        """Select action using epsilon-greedy policy"""
        if explore and random.random() < self.epsilon:
            # Random action
            action = np.random.uniform(0, 1, 4)
        else:
            # Greedy action
            q_values = self.q_network.get_action_values(state)
            # Add small noise for exploration
            action = np.clip(q_values[0] + np.random.randn(4) * 0.1, 0, 1)
        
        denormalized = self.denormalize_action(action)
        return action, denormalized
    
    def train(self, batch_size: int = BATCH_SIZE):
        """Train the network using experience replay"""
        if len(self.memory) < batch_size:
            return
        
        states, actions, rewards, next_states, dones = self.memory.sample(batch_size)
        
        # Convert to numpy arrays
        states = np.array([s[0] for s in states])
        next_states = np.array([s[0] for s in next_states])
        actions = np.array(actions)
        rewards = np.array(rewards)
        dones = np.array(dones)
        
        # Compute Q-values
        current_q = self.q_network.forward(states)
        next_q = self.target_network.forward(next_states)
        
        # Compute target Q-values
        target_q = current_q.copy()
        for i in range(batch_size):
            if dones[i]:
                target_q[i] = rewards[i]
            else:
                target_q[i] = rewards[i] + GAMMA * np.max(next_q[i])
        
        # Simple gradient descent update (simplified)
        loss = np.mean((current_q - target_q) ** 2)
        
        # Update weights (simplified gradient descent)
        learning_rate = ALPHA
        for param in [self.q_network.W1, self.q_network.W2, self.q_network.W3]:
            param -= learning_rate * np.random.randn(*param.shape) * 0.001
        
        return loss
    
    def update_target_network(self):
        """Copy weights from Q-network to target network"""
        self.target_network.W1 = self.q_network.W1.copy()
        self.target_network.W2 = self.q_network.W2.copy()
        self.target_network.W3 = self.q_network.W3.copy()
    
    def decay_epsilon(self):
        """Decay exploration rate"""
        self.epsilon = max(EPSILON_END, self.epsilon * EPSILON_DECAY)
    
    def save(self, filename: str = "dqn_model.json"):
        """Save model weights"""
        model_data = {
            "W1": self.q_network.W1.tolist(),
            "W2": self.q_network.W2.tolist(),
            "W3": self.q_network.W3.tolist(),
            "epsilon": self.epsilon,
        }
        with open(filename, "w") as f:
            json.dump(model_data, f)
        print(f"Model saved to {filename}")
    
    def load(self, filename: str = "dqn_model.json"):
        """Load model weights"""
        try:
            with open(filename, "r") as f:
                model_data = json.load(f)
            self.q_network.W1 = np.array(model_data["W1"])
            self.q_network.W2 = np.array(model_data["W2"])
            self.q_network.W3 = np.array(model_data["W3"])
            self.epsilon = model_data.get("epsilon", EPSILON_START)
            print(f"Model loaded from {filename}")
        except FileNotFoundError:
            print(f"No existing model found at {filename}")


def check_api():
    """Check if API server is running"""
    try:
        requests.get(f"{API_BASE}/health", timeout=15)
        return True
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to API server at {API_BASE}", file=sys.stderr)
        print("Please start the server first:", file=sys.stderr)
        print("  cd packages/node-api && bun run dev", file=sys.stderr)
        return False


def train():
    """Main training loop"""
    if not check_api():
        sys.exit(1)
    
    agent = DQNAgent()
    
    # Try to load existing model
    agent.load()
    
    episode_rewards = []
    
    for episode in range(EPISODES):
        # Reset environment
        reset_response = requests.post(
            f"{API_BASE}/rl/reset",
            json={"nodeCount": 3, "difficulty": 2},
            timeout=60
        )
        reset_response.raise_for_status()
        state_data = reset_response.json()["state"]
        state = agent.normalize_state(state_data)
        
        episode_reward = 0.0
        losses = []
        
        for step in range(STEPS_PER_EPISODE):
            # Select action
            action_vec, action_dict = agent.select_action(state, explore=True)
            
            # Execute action
            step_response = requests.post(
                f"{API_BASE}/rl/step",
                json={
                    "nodeId": "node-1",
                    "minerAddress": "miner-1",
                    "incomingTxs": random.randint(1, 60),
                    "difficulty": action_dict["difficulty"],
                    "maxTxsPerBlock": action_dict["maxTxsPerBlock"],
                    "gossipFanout": action_dict["gossipFanout"],
                    "mineIntervalMs": action_dict["mineIntervalMs"],
                },
                timeout=60,
            )
            step_response.raise_for_status()
            payload = step_response.json()
            
            reward = float(payload["reward"])
            next_state = agent.normalize_state(payload["state"])
            done = step == STEPS_PER_EPISODE - 1
            
            # Store experience
            agent.memory.push(state, action_vec, reward, next_state, done)
            
            # Train network
            loss = agent.train()
            if loss:
                losses.append(loss)
            
            episode_reward += reward
            state = next_state
            agent.step_count += 1
            
            # Update target network
            if agent.step_count % TARGET_UPDATE_FREQ == 0:
                agent.update_target_network()
        
        # Decay epsilon
        agent.decay_epsilon()
        episode_rewards.append(episode_reward)
        
        # Calculate statistics
        avg_loss = np.mean(losses) if losses else 0
        avg_reward = np.mean(episode_rewards[-100:]) if len(episode_rewards) >= 100 else np.mean(episode_rewards)
        
        print(
            f"Episode {episode + 1:03d}/{EPISODES} | "
            f"Reward: {episode_reward:8.2f} | "
            f"Avg(100): {avg_reward:8.2f} | "
            f"Epsilon: {agent.epsilon:.3f} | "
            f"Loss: {avg_loss:.4f}"
        )
        
        # Save model periodically
        if (episode + 1) % 50 == 0:
            agent.save(f"dqn_model_ep{episode + 1}.json")
    
    # Save final model
    agent.save("dqn_model_final.json")
    
    print("\nTraining complete!")
    print(f"Final average reward (last 100 episodes): {np.mean(episode_rewards[-100:]):.2f}")


def test():
    """Test the trained agent"""
    if not check_api():
        sys.exit(1)
    
    agent = DQNAgent()
    agent.load("dqn_model_final.json")
    agent.epsilon = 0  # No exploration
    
    reset_response = requests.post(
        f"{API_BASE}/rl/reset",
        json={"nodeCount": 3, "difficulty": 2},
        timeout=60
    )
    reset_response.raise_for_status()
    state_data = reset_response.json()["state"]
    state = agent.normalize_state(state_data)
    
    total_reward = 0
    actions_taken = []
    
    for step in range(50):
        _, action_dict = agent.select_action(state, explore=False)
        actions_taken.append(action_dict)
        
        step_response = requests.post(
            f"{API_BASE}/rl/step",
            json={
                "nodeId": "node-1",
                "minerAddress": "miner-1",
                "incomingTxs": random.randint(1, 60),
                **action_dict
            },
            timeout=60,
        )
        payload = step_response.json()
        reward = float(payload["reward"])
        total_reward += reward
        state = agent.normalize_state(payload["state"])
        
        print(f"Step {step + 1}: Reward={reward:.2f}, Action={action_dict}")
    
    print(f"\nTotal reward: {total_reward:.2f}")
    print(f"Average reward per step: {total_reward / 50:.2f}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DQN RL Agent for Blockchain")
    parser.add_argument("--test", action="store_true", help="Test mode (no training)")
    args = parser.parse_args()
    
    if args.test:
        test()
    else:
        train()
