#!/usr/bin/env python3
"""
Blockchain Q-Learning Simulation

This script runs the complete blockchain simulation with Q-learning based
adaptive consensus. It trains the RL agent over multiple episodes and
exports metrics for visualization.

Usage:
    python main.py [--episodes N] [--verbose]

Components:
    - Block: Basic blockchain block structure
    - Node: Network node with local chain
    - NetworkSimulator: P2P network with latency and packet loss
    - QLearningAgent: Q-learning implementation
    - BlockchainEnvironment: RL training environment
    - MetricsCollector: Metrics tracking and export
"""

import argparse
import sys
import time
from pathlib import Path

# Add python-sim directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from block import Block
from node import Node
from network import NetworkSimulator
from rl_agent import QLearningAgent
from environment import BlockchainEnvironment
from metrics import MetricsCollector, SimulationMetrics

def train_agent(
    num_episodes: int = 50,
    verbose: bool = True,
    save_policy: bool = True
) -> MetricsCollector:
    """
    Train the Q-learning agent over multiple episodes.
    
    Args:
        num_episodes: Number of training episodes
        verbose: Print progress messages
        save_policy: Save learned policy to file
    
    Returns:
        MetricsCollector with all training data
    """
    
    # Initialize components
    env = BlockchainEnvironment(num_nodes=5)
    agent = env.agent
    metrics = MetricsCollector(output_file="metrics.json")
    
    if verbose:
        print("="*60)
        print("BLOCKCHAIN Q-LEARNING SIMULATION")
        print("="*60)
        print(f"Configuration:")
        print(f"  Episodes: {num_episodes}")
        print(f"  Nodes: 5 (1 RL agent)")
        print(f"  Learning rate: {agent.learning_rate}")
        print(f"  Discount factor: {agent.discount_factor}")
        print(f"  Initial exploration: {agent.exploration_rate}")
        print("="*60)
        print()
    
    # Training loop
    for episode in range(num_episodes):
        # Reset environment
        state = env.reset()
        confirmations, fork_length, peer_trust = state
        
        # Track episode statistics
        episode_reward = 0.0
        episode_steps = 0
        blocks_accepted = 0
        blocks_rejected = 0
        
        if verbose and episode % 10 == 0:
            print(f"\n[Episode {episode}/{num_episodes}] Training...")
            print(f"  Exploration rate: {agent.exploration_rate:.3f}")
        
        # Episode loop
        done = False
        while not done:
            # Agent chooses action
            action = agent.choose_action(confirmations, fork_length, peer_trust)
            
            # Execute action in environment
            next_state, reward, done, info = env.step(action)
            next_confirmations, next_fork_length, next_trust = next_state
            
            # Update agent
            agent.update(
                confirmations=confirmations,
                fork_length=fork_length,
                peer_trust=peer_trust,
                action=action,
                reward=reward,
                next_confirmations=next_confirmations,
                next_fork_length=next_fork_length,
                next_trust=next_trust,
                done=done
            )
            
            # Track statistics
            episode_reward += reward
            episode_steps += 1
            
            if action == "accept":
                blocks_accepted += 1
            elif action == "reject":
                blocks_rejected += 1
            
            # Update state
            state = next_state
            confirmations, fork_length, peer_trust = next_state
        
        # Record episode metrics
        episode_metrics = SimulationMetrics(
            episode=episode,
            total_reward=episode_reward,
            consensus_time=env.network.current_time,
            fork_count=env.forks_in_episode,
            blocks_accepted=blocks_accepted,
            blocks_rejected=blocks_rejected,
            accuracy=env._calculate_accuracy(),
            exploration_rate=agent.exploration_rate
        )
        metrics.add_episode(episode_metrics)
        
        # Decay exploration
        agent.decay_exploration()
        
        # Episode summary (every 10 episodes)
        if verbose and episode % 10 == 0:
            print(f"  Reward: {episode_reward:.2f} | "
                  f"Consensus time: {env.network.current_time:.2f}s | "
                  f"Forks: {env.forks_in_episode} | "
                  f"Accuracy: {env._calculate_accuracy():.2%}")
    
    # Print final summary
    if verbose:
        print("\n" + "="*60)
        print("TRAINING COMPLETE")
        print("="*60)
    
    metrics.print_summary()
    
    # Save metrics
    metrics.save()
    
    # Save learned policy
    if save_policy:
        agent.save_q_table("q_table.json")
        if verbose:
            print("\nLearned policy saved to q_table.json")
    
    return metrics

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Blockchain Q-Learning Simulation"
    )
    parser.add_argument(
        '--episodes',
        type=int,
        default=50,
        help='Number of training episodes (default: 50)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        default=True,
        help='Enable verbose output'
    )
    parser.add_argument(
        '--quiet',
        action='store_true',
        help='Suppress all output except errors'
    )
    
    args = parser.parse_args()
    
    verbose = not args.quiet
    
    try:
        # Run training
        metrics = train_agent(
            num_episodes=args.episodes,
            verbose=verbose
        )
        
        if verbose:
            print("\nSimulation completed successfully!")
            print(f"Metrics exported to: {metrics.output_file}")
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
