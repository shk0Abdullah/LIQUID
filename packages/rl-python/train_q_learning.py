import random
import sys
from collections import defaultdict

import requests

API_BASE = "http://localhost:3000"
EPISODES = 420
STEPS_PER_EPISODE = 210
ALPHA = 0.2
GAMMA = 0.95
EPSILON_START = 1.0
EPSILON_END = 0.05
EPSILON_DECAY = 0.96

# Discrete action templates over adaptive controls.
ACTIONS = [
    {"difficulty": 2, "maxTxsPerBlock": 8, "gossipFanout": 0.3, "mineIntervalMs": 1200},
    {"difficulty": 3, "maxTxsPerBlock": 16, "gossipFanout": 0.5, "mineIntervalMs": 1000},
    {"difficulty": 4, "maxTxsPerBlock": 32, "gossipFanout": 0.7, "mineIntervalMs": 800},
]


def bucket_pending(value: float) -> int:
    if value < 10:
        return 0
    if value < 50:
        return 1
    return 2


def bucket_tps(value: float) -> int:
    if value < 3:
        return 0
    if value < 10:
        return 1
    return 2


def bucket_delay(value: float) -> int:
    if value < 80:
        return 0
    if value < 180:
        return 1
    return 2


def to_state(state_payload: dict) -> tuple[int, int, int]:
    return (
        bucket_pending(float(state_payload.get("mempool_size", 0))),
        bucket_tps(float(state_payload.get("current_tps", 0))),
        bucket_delay(float(state_payload.get("network_delay", 0))),
    )


def choose_action_index(q_table, state, epsilon: float) -> int:
    if random.random() < epsilon:
        return random.randrange(len(ACTIONS))
    values = [q_table[(state, action_index)] for action_index in range(len(ACTIONS))]
    max_q = max(values)
    best_actions = [
        action_index for action_index, q_value in enumerate(values) if q_value == max_q
    ]
    return random.choice(best_actions)


def main():
    # Check if API server is running
    try:
        requests.get(f"{API_BASE}/health", timeout=15)
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to API server at {API_BASE}", file=sys.stderr)
        print("Please start the server first:", file=sys.stderr)
        print("  cd packages/node-api && bun run dev", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"Error: Could not connect to API server at {API_BASE}: {e}", file=sys.stderr)
        print("Please ensure the server is running:", file=sys.stderr)
        print("  cd packages/node-api && bun run dev", file=sys.stderr)
        sys.exit(1)

    q_table = defaultdict(float)
    epsilon = EPSILON_START

    for episode in range(EPISODES):
        reset_response = requests.post(
            f"{API_BASE}/rl/reset", json={"nodeCount": 3, "difficulty": 2}, timeout=60
        )
        reset_response.raise_for_status()
        current_state = to_state(reset_response.json()["state"])

        episode_reward = 0.0
        for _ in range(STEPS_PER_EPISODE):
            action_index = choose_action_index(q_table, current_state, epsilon)
            action = ACTIONS[action_index]
            step_response = requests.post(
                f"{API_BASE}/rl/step",
                json={
                    "nodeId": "node-1",
                    "minerAddress": "miner-1",
                    "incomingTxs": random.randint(1, 60),
                    "difficulty": action["difficulty"],
                    "maxTxsPerBlock": action["maxTxsPerBlock"],
                    "gossipFanout": action["gossipFanout"],
                    "mineIntervalMs": action["mineIntervalMs"],
                },
                timeout=60,
            )
            step_response.raise_for_status()
            payload = step_response.json()
            reward = float(payload["reward"])
            next_state = to_state(payload["state"])

            old_q = q_table[(current_state, action_index)]
            next_max = max(
                q_table[(next_state, next_action_index)]
                for next_action_index in range(len(ACTIONS))
            )
            q_table[(current_state, action_index)] = old_q + ALPHA * (
                reward + GAMMA * next_max - old_q
            )

            episode_reward += reward
            current_state = next_state

        epsilon = max(EPSILON_END, epsilon * EPSILON_DECAY)
        print(
            f"Episode {episode + 1:02d} | reward={episode_reward:.2f} | epsilon={epsilon:.3f}"
        )

    print("Training complete.")
    print("Sample learned Q-values:")
    for key in list(q_table.keys())[:10]:
        print(f"{key}: {q_table[key]:.3f}")


if __name__ == "__main__":
    main()
