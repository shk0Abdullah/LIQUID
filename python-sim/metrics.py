import json
from typing import List, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class SimulationMetrics:
    """Data class for storing simulation metrics."""
    episode: int
    total_reward: float
    consensus_time: float
    fork_count: int
    blocks_accepted: int
    blocks_rejected: int
    accuracy: float
    exploration_rate: float = 0.0

class MetricsCollector:
    """
    Collects and manages metrics from blockchain simulation.
    
    Tracks:
    - Episode-by-episode results
    - Overall training statistics
    - Q-learning progress
    """
    
    def __init__(self, output_file: str = "metrics.json"):
        self.output_file = output_file
        self.episodes: List[Dict[str, Any]] = []
        self.start_time = datetime.now().isoformat()
        
    def add_episode(self, metrics: SimulationMetrics):
        """Add metrics from a single episode."""
        episode_data = asdict(metrics)
        episode_data['timestamp'] = datetime.now().isoformat()
        self.episodes.append(episode_data)
    
    def get_summary(self) -> Dict[str, Any]:
        """Generate summary statistics across all episodes."""
        if not self.episodes:
            return {}
        
        # Calculate averages
        avg_reward = sum(e['total_reward'] for e in self.episodes) / len(self.episodes)
        avg_consensus_time = sum(e['consensus_time'] for e in self.episodes) / len(self.episodes)
        avg_accuracy = sum(e['accuracy'] for e in self.episodes) / len(self.episodes)
        total_forks = sum(e['fork_count'] for e in self.episodes)
        
        return {
            'total_episodes': len(self.episodes),
            'avg_reward': avg_reward,
            'avg_consensus_time': avg_consensus_time,
            'avg_accuracy': avg_accuracy,
            'total_forks': total_forks,
            'training_duration': self.start_time
        }
    
    def get_trend_data(self) -> List[Dict[str, Any]]:
        """Get data for trend analysis and charts."""
        return [
            {
                'episode': e['episode'],
                'reward': e['total_reward'],
                'consensus_time': e['consensus_time'],
                'fork_count': e['fork_count'],
                'accuracy': e['accuracy'],
                'exploration_rate': e.get('exploration_rate', 0)
            }
            for e in self.episodes
        ]
    
    def save(self):
        """Save all metrics to JSON file."""
        data = {
            'metadata': {
                'created': datetime.now().isoformat(),
                'simulation_type': 'Blockchain RL Consensus',
                'version': '1.0'
            },
            'summary': self.get_summary(),
            'episodes': self.episodes,
            'trends': self.get_trend_data()
        }
        
        with open(self.output_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Metrics saved to {self.output_file}")
    
    def load(self) -> bool:
        """Load metrics from existing JSON file."""
        try:
            with open(self.output_file, 'r') as f:
                data = json.load(f)
            
            self.episodes = data.get('episodes', [])
            self.start_time = data.get('metadata', {}).get('created', datetime.now().isoformat())
            return True
        except FileNotFoundError:
            return False
    
    def print_summary(self):
        """Print a readable summary of results."""
        summary = self.get_summary()
        
        print("\n" + "="*60)
        print("SIMULATION RESULTS SUMMARY")
        print("="*60)
        print(f"Total Episodes: {summary.get('total_episodes', 0)}")
        print(f"Average Reward: {summary.get('avg_reward', 0):.2f}")
        print(f"Average Consensus Time: {summary.get('avg_consensus_time', 0):.2f}s")
        print(f"Average Accuracy: {summary.get('avg_accuracy', 0):.2%}")
        print(f"Total Forks: {summary.get('total_forks', 0)}")
        print("="*60)
        
        # Print last few episodes
        if self.episodes:
            print("\nRecent Episodes:")
            print("-"*60)
            for ep in self.episodes[-5:]:
                print(f"Episode {ep['episode']:3d}: "
                      f"reward={ep['total_reward']:7.2f} | "
                      f"time={ep['consensus_time']:5.2f}s | "
                      f"forks={ep['fork_count']:2d} | "
                      f"acc={ep['accuracy']:.2%}")
