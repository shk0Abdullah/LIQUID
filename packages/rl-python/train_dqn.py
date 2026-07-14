"""
Multi-agent DQN trainer for adaptive blockchain RL.
Each node gets its own DQN with 3 sub-policy heads.

Usage:
  pip install torch requests
  python train_dqn.py
  python train_dqn.py --test
  python train_dqn.py --propagation-delay 50
"""

import argparse
import random
import sys
from collections import deque
from typing import Dict

import requests
import torch
import torch.nn as nn
import torch.optim as optim

API_BASE = "http://localhost:3000"
EPISODES = 200
STEPS_PER_EPISODE = 50
GAMMA = 0.95
EPSILON_START = 1.0
EPSILON_END = 0.05
EPSILON_DECAY = 0.97
BATCH_SIZE = 32
MEMORY_SIZE = 5000
TARGET_UPDATE_FREQ = 50
LR = 1e-3

STATE_DIM = 4

DIFFICULTY_ACTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12]
MAX_TXS_ACTIONS = [5, 10, 20, 30, 50, 80, 100]
FANOUT_ACTIONS = [1, 2, 3, 4, 5]

DIFFICULTY_DIM = len(DIFFICULTY_ACTIONS)
MAX_TXS_DIM = len(MAX_TXS_ACTIONS)
FANOUT_DIM = len(FANOUT_ACTIONS)


class SubPolicyDQN(nn.Module):
    def __init__(self, state_dim: int, action_dim: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class NodeAgent:
    def __init__(self, node_id: str):
        self.node_id = node_id
        self.dqn_diff = SubPolicyDQN(STATE_DIM, DIFFICULTY_DIM)
        self.dqn_txs = SubPolicyDQN(STATE_DIM, MAX_TXS_DIM)
        self.dqn_fan = SubPolicyDQN(STATE_DIM, FANOUT_DIM)
        self.target_diff = SubPolicyDQN(STATE_DIM, DIFFICULTY_DIM)
        self.target_txs = SubPolicyDQN(STATE_DIM, MAX_TXS_DIM)
        self.target_fan = SubPolicyDQN(STATE_DIM, FANOUT_DIM)
        self._sync_targets()
        self.opt_diff = optim.Adam(self.dqn_diff.parameters(), lr=LR)
        self.opt_txs = optim.Adam(self.dqn_txs.parameters(), lr=LR)
        self.opt_fan = optim.Adam(self.dqn_fan.parameters(), lr=LR)
        self.memory: deque = deque(maxlen=MEMORY_SIZE)
        self.epsilon = EPSILON_START
        self.step_count = 0

    def _sync_targets(self):
        self.target_diff.load_state_dict(self.dqn_diff.state_dict())
        self.target_txs.load_state_dict(self.dqn_txs.state_dict())
        self.target_fan.load_state_dict(self.dqn_fan.state_dict())

    def state_to_tensor(self, state: Dict) -> torch.Tensor:
        return torch.tensor(
            [
                state.get("mempool_size", 0) / 1000.0,
                state.get("block_utilization", 0),
                min(state.get("forks_detected", 0), 10) / 10.0,
                min(state.get("block_interval_ms", 0), 30000) / 30000.0,
            ],
            dtype=torch.float32,
        )

    def select_action(self, state: Dict, explore: bool = True) -> Dict:
        s = self.state_to_tensor(state).unsqueeze(0)
        actions = {}

        for policy_name, dqn, action_list, dim in [
            ("difficulty", self.dqn_diff, DIFFICULTY_ACTIONS, DIFFICULTY_DIM),
            ("maxTxsPerBlock", self.dqn_txs, MAX_TXS_ACTIONS, MAX_TXS_DIM),
            ("gossipFanout", self.dqn_fan, FANOUT_ACTIONS, FANOUT_DIM),
        ]:
            if explore and random.random() < self.epsilon:
                idx = random.randrange(dim)
            else:
                with torch.no_grad():
                    q = dqn(s)
                    idx = q.argmax(dim=1).item()
            actions[policy_name] = action_list[idx]

        actions["gossipFanout"] = actions["gossipFanout"] / 5.0
        return actions

    def store(self, state, actions, reward, next_state, done):
        self.memory.append((state, actions, reward, next_state, done))

    def train_step(self):
        if len(self.memory) < BATCH_SIZE:
            return 0.0

        batch = random.sample(self.memory, BATCH_SIZE)
        total_loss = 0.0

        for policy_name, dqn, target, optimizer, action_list in [
            ("difficulty", self.dqn_diff, self.target_diff, self.opt_diff, DIFFICULTY_ACTIONS),
            ("maxTxsPerBlock", self.dqn_txs, self.target_txs, self.opt_txs, MAX_TXS_ACTIONS),
            ("gossipFanout", self.dqn_fan, self.target_fan, self.opt_fan, FANOUT_ACTIONS),
        ]:
            states = []
            action_indices = []
            rewards = []
            next_states = []
            dones = []

            for s, a, r, ns, d in batch:
                states.append(self.state_to_tensor(s))
                action_val = a[policy_name]
                if policy_name == "gossipFanout":
                    action_val = round(action_val * 5.0)
                try:
                    idx = action_list.index(action_val)
                except ValueError:
                    idx = 0
                action_indices.append(idx)
                rewards.append(r)
                next_states.append(self.state_to_tensor(ns))
                dones.append(d)

            states_t = torch.stack(states)
            next_states_t = torch.stack(next_states)
            action_indices_t = torch.tensor(action_indices, dtype=torch.long)
            rewards_t = torch.tensor(rewards, dtype=torch.float32)
            dones_t = torch.tensor(dones, dtype=torch.float32)

            current_q = dqn(states_t).gather(1, action_indices_t.unsqueeze(1)).squeeze(1)
            with torch.no_grad():
                next_q = target(next_states_t).max(1)[0]
                target_q = rewards_t + GAMMA * next_q * (1 - dones_t)

            loss = nn.MSELoss()(current_q, target_q)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        return total_loss / 3.0

    def update_targets(self):
        self._sync_targets()

    def decay_epsilon(self):
        self.epsilon = max(EPSILON_END, self.epsilon * EPSILON_DECAY)

    def save(self, path: str):
        torch.save(
            {
                "dqn_diff": self.dqn_diff.state_dict(),
                "dqn_txs": self.dqn_txs.state_dict(),
                "dqn_fan": self.dqn_fan.state_dict(),
                "epsilon": self.epsilon,
            },
            path,
        )

    def load(self, path: str):
        try:
            data = torch.load(path, weights_only=True)
            self.dqn_diff.load_state_dict(data["dqn_diff"])
            self.dqn_txs.load_state_dict(data["dqn_txs"])
            self.dqn_fan.load_state_dict(data["dqn_fan"])
            self._sync_targets()
            self.epsilon = data.get("epsilon", EPSILON_START)
            print(f"Loaded model from {path}")
        except FileNotFoundError:
            print(f"No model at {path}, starting fresh")


def check_api() -> bool:
    try:
        requests.get(f"{API_BASE}/health", timeout=5)
        return True
    except requests.exceptions.ConnectionError:
        print(f"Error: Cannot connect to {API_BASE}", file=sys.stderr)
        print("Start server: cd packages/node-api && bun run dev", file=sys.stderr)
        return False


def get_node_states() -> Dict[str, Dict]:
    resp = requests.get(f"{API_BASE}/network/state", timeout=10)
    data = resp.json()
    states = {}
    for node_info in data["nodes"]:
        nid = node_info["id"]
        states[nid] = {
            "mempool_size": node_info["pendingTxCount"],
            "block_utilization": node_info["metrics"]["blockUtilization"],
            "forks_detected": node_info["metrics"]["forksDetected"],
            "block_interval_ms": node_info["metrics"]["blockIntervalMs"],
        }
    return states


def train(propagation_delay: int = 0):
    if not check_api():
        sys.exit(1)

    reset_payload = {"nodeCount": 3, "difficulty": 2}
    if propagation_delay > 0:
        reset_payload["propagationDelayMs"] = propagation_delay

    resp = requests.post(f"{API_BASE}/rl/reset", json=reset_payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    node_ids = list(data["state"].keys())

    agents = {nid: NodeAgent(nid) for nid in node_ids}
    for agent in agents.values():
        agent.load("dqn_model.pt")

    episode_rewards = {nid: [] for nid in node_ids}

    for episode in range(EPISODES):
        reset_resp = requests.post(f"{API_BASE}/rl/reset", json=reset_payload, timeout=120)
        reset_resp.raise_for_status()
        reset_data = reset_resp.json()
        node_ids = list(reset_data["state"].keys())
        if set(node_ids) != set(agents.keys()):
            agents = {nid: NodeAgent(nid) for nid in node_ids}

        ep_rewards = {nid: 0.0 for nid in node_ids}
        ep_losses = []

        for step in range(STEPS_PER_EPISODE):
            current_states = get_node_states()
            actions_map = {}

            for nid in node_ids:
                actions_map[nid] = agents[nid].select_action(current_states[nid], explore=True)

            step_resp = requests.post(
                f"{API_BASE}/rl/step",
                json={"incomingTxs": random.randint(3, 20), "actions": actions_map},
                timeout=120,
            )
            step_resp.raise_for_status()
            step_data = step_resp.json()

            next_states = step_data.get("state", current_states)

            for nid in node_ids:
                reward = step_data["reward"].get(nid, 0.0)
                done = step == STEPS_PER_EPISODE - 1

                agents[nid].store(current_states[nid], actions_map[nid], reward, next_states.get(nid, current_states[nid]), done)
                loss = agents[nid].train_step()
                if loss > 0:
                    ep_losses.append(loss)

                agents[nid].step_count += 1
                if agents[nid].step_count % TARGET_UPDATE_FREQ == 0:
                    agents[nid].update_targets()

                ep_rewards[nid] += reward

        for agent in agents.values():
            agent.decay_epsilon()

        for nid in node_ids:
            episode_rewards[nid].append(ep_rewards[nid])

        avg_loss = sum(ep_losses) / len(ep_losses) if ep_losses else 0
        reward_str = " | ".join(f"{nid}: {ep_rewards[nid]:.1f}" for nid in node_ids)
        eps = agents[node_ids[0]].epsilon
        print(f"Ep {episode + 1:03d}/{EPISODES} | {reward_str} | eps={eps:.3f} | loss={avg_loss:.4f}")

        if (episode + 1) % 50 == 0:
            for agent in agents.values():
                agent.save(f"dqn_model_ep{episode + 1}.pt")

    for agent in agents.values():
        agent.save("dqn_model_final.pt")

    print("\nTraining complete!")
    for nid in node_ids:
        last100 = episode_rewards[nid][-100:]
        print(f"  {nid} avg reward (last 100): {sum(last100) / len(last100):.2f}")


def test(propagation_delay: int = 0):
    if not check_api():
        sys.exit(1)

    reset_payload = {"nodeCount": 3, "difficulty": 2}
    if propagation_delay > 0:
        reset_payload["propagationDelayMs"] = propagation_delay

    reset_resp = requests.post(f"{API_BASE}/rl/reset", json=reset_payload, timeout=120)
    reset_resp.raise_for_status()
    reset_data = reset_resp.json()
    node_ids = list(reset_data["state"].keys())

    agents = {nid: NodeAgent(nid) for nid in node_ids}
    for agent in agents.values():
        agent.load("dqn_model_final.pt")
        agent.epsilon = 0

    total_rewards = {nid: 0.0 for nid in node_ids}

    for step in range(30):
        current_states = get_node_states()
        actions_map = {}

        for nid in node_ids:
            actions_map[nid] = agents[nid].select_action(current_states[nid], explore=False)

        step_resp = requests.post(
            f"{API_BASE}/rl/step",
            json={"incomingTxs": random.randint(3, 15), "actions": actions_map},
            timeout=120,
        )
        step_data = step_resp.json()

        for nid in node_ids:
            reward = step_data["reward"].get(nid, 0.0)
            total_rewards[nid] += reward
            a = actions_map[nid]
            print(
                f"Step {step + 1}: {nid} reward={reward:.2f} "
                f"diff={a['difficulty']} maxTxs={a['maxTxsPerBlock']} fanout={a['gossipFanout']:.2f}"
            )

    print(f"\nTotal rewards: {total_rewards}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-agent DQN for Adaptive Blockchain")
    parser.add_argument("--test", action="store_true", help="Test trained agent")
    parser.add_argument("--propagation-delay", type=int, default=0, help="Simulated propagation delay in ms")
    args = parser.parse_args()

    if args.test:
        test(args.propagation_delay)
    else:
        train(args.propagation_delay)
