import random
from collections import defaultdict

import requests

API_BASE = "http://localhost:4000"
EPISODES = 420
STEPS_PER_EPISODE = 210
ALPHA = 0.2
GAMMA = 0.95
EPSILON_START = 1.0
EPSILON_END = 0.05
EPSILON_DECAY = 0.96

# Discrete actions for v1:
# -1: decrease difficulty
#  0: keep difficulty
# +1: increase difficulty
ACTIONS = [-1, 0, 1]


def bucket_pending(value: float) -> int:
    if value < 2:
        return 0
    if value < 5:
        return 1
    return 2


def bucket_height(value: int) -> int:
    if value < 3:
        return 0
    if value < 8:
        return 1
    return 2


def bucket_difficulty(value: int) -> int:
    if value <= 2:
        return 0
    if value <= 4:
        return 1
    return 2


def to_state(state_payload: dict) -> tuple[int, int, int]:
    nodes = state_payload.get("nodes", [])
    difficulty = nodes[0]["difficulty"] if nodes else 2
    return (
        bucket_pending(float(state_payload.get("avgPendingTxCount", 0))),
        bucket_difficulty(int(difficulty)),
        bucket_height(int(state_payload.get("maxHeight", 1))),
    )


def choose_action(q_table, state, epsilon: float) -> int:
    if random.random() < epsilon:
        return random.choice(ACTIONS)
    values = [q_table[(state, action)] for action in ACTIONS]
    max_q = max(values)
    best_actions = [action for action, q_value in zip(ACTIONS, values) if q_value == max_q]
    return random.choice(best_actions)


def main():
    q_table = defaultdict(float)
    epsilon = EPSILON_START

    for episode in range(EPISODES):
        reset_response = requests.post(
            f"{API_BASE}/rl/reset", json={"nodeCount": 3, "difficulty": 2}, timeout=10
        )
        reset_response.raise_for_status()
        current_state = to_state(reset_response.json())

        episode_reward = 0.0
        for _ in range(STEPS_PER_EPISODE):
            action = choose_action(q_table, current_state, epsilon)
            step_response = requests.post(
                f"{API_BASE}/rl/step",
                json={
                    "nodeId": "node-1",
                    "minerAddress": "miner-1",
                    "difficultyDelta": action,
                    "txCount": random.randint(1, 3),
                },
                timeout=30,
            )
            step_response.raise_for_status()
            payload = step_response.json()
            reward = float(payload["reward"])
            next_state = to_state(payload["state"])

            old_q = q_table[(current_state, action)]
            next_max = max(q_table[(next_state, next_action)] for next_action in ACTIONS)
            q_table[(current_state, action)] = old_q + ALPHA * (
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
