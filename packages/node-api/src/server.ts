/// <reference types="bun" />
/// <reference types="node" />

import { BlockchainNetwork } from "./network.js";

const port = Number(process.env.PORT ?? 3000);
const network = await BlockchainNetwork.create(3);

interface RlState {
  mempool_size: number;
  block_utilization: number;
  forks_detected: number;
  block_interval_ms: number;
}

interface NodeAction {
  difficulty?: number;
  maxTxsPerBlock?: number;
  gossipFanout?: number;
  propagationDelayMs?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toInt(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function getNodeRlState(nodeId: string): RlState {
  const info = network.getNodeInfo(nodeId);
  const metrics = network.getNodeMetrics(nodeId);
  return {
    mempool_size: info.pendingTxCount,
    block_utilization: Math.round(metrics.blockUtilization * 1000) / 1000,
    forks_detected: metrics.forksDetected,
    block_interval_ms: metrics.blockIntervalMs,
  };
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}

const FORK_PENALTY = 3.0;

Bun.serve({
  port,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "GET" && pathname === "/health") {
      return json({ ok: true });
    }

    if (request.method === "GET" && pathname === "/network/nodes") {
      return json({ nodes: network.listNodes() });
    }

    if (request.method === "GET" && pathname === "/network/state") {
      return json(network.getState());
    }

    if (request.method === "POST" && pathname === "/network/nodes") {
      const node = await network.addNode();
      return json(node, 201);
    }

    if (request.method === "POST" && pathname === "/network/reset") {
      const body = await readJson(request);
      const nodeCount = Number(body.nodeCount ?? 3);
      const propagationDelay = Number(body.propagationDelayMs ?? 0);
      if (Number.isFinite(propagationDelay) && propagationDelay > 0) {
        network.setPropagationDelay(propagationDelay);
      }
      await network.reset(
        Number.isFinite(nodeCount) && nodeCount > 0 ? nodeCount : 3,
      );
      return json(network.getState());
    }

    if (request.method === "POST" && pathname === "/transactions") {
      const body = await readJson(request);
      const from = String(body.from ?? "");
      const to = String(body.to ?? "");
      const amount = Number(body.amount ?? 0);

      if (from === "" || to === "" || !Number.isFinite(amount) || amount <= 0) {
        return errorResponse("Invalid transaction payload");
      }

      const result = network.submitTransaction(from, to, amount);
      return json(result, 201);
    }

    if (request.method === "POST" && pathname === "/mine") {
      const body = await readJson(request);
      const nodeId = String(body.nodeId ?? "node-1");
      const minerAddress = String(body.minerAddress ?? "miner-1");

      try {
        const result = await network.mine(nodeId, minerAddress);
        return json(result);
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Mining failed",
          404,
        );
      }
    }

    if (request.method === "GET" && pathname === "/chain") {
      const nodeId = url.searchParams.get("nodeId") ?? "node-1";
      try {
        return json({ nodeId, chain: network.getNodeChain(nodeId) });
      } catch (error) {
        return errorResponse(
          error instanceof Error ? error.message : "Node not found",
          404,
        );
      }
    }

    if (request.method === "GET" && pathname === "/network/topology") {
      return json({
        topology: network.getNetworkTopology(),
        nodeCount: network.listNodes().length,
      });
    }

    if (request.method === "POST" && pathname === "/network/discover") {
      network.triggerNeighborDiscovery();
      return json({
        topology: network.getNetworkTopology(),
        message: "Neighbor discovery triggered for all nodes",
      });
    }

    if (request.method === "POST" && pathname === "/network/config") {
      const body = await readJson(request);
      const nodeId = String(body.nodeId ?? "");
      const difficulty = body.difficulty;
      const maxTxs = body.maxTxsPerBlock;

      if (!nodeId) return errorResponse("nodeId required");

      if (difficulty !== undefined && Number.isFinite(Number(difficulty))) {
        network.setDifficulty(nodeId, toInt(Number(difficulty), 1, 12));
      }
      if (maxTxs !== undefined && Number.isFinite(Number(maxTxs))) {
        network.setMaxTransactionsPerBlock(
          nodeId,
          toInt(Number(maxTxs), 1, 500),
        );
      }

      return json(network.getNodeInfo(nodeId));
    }

    if (request.method === "POST" && pathname === "/rl/reset") {
      const body = await readJson(request);
      const nodeCount = Number(body.nodeCount ?? 3);
      const difficulty = Number(body.difficulty ?? 2);
      const propagationDelay = Number(body.propagationDelayMs ?? 0);

      if (Number.isFinite(propagationDelay) && propagationDelay > 0) {
        network.setPropagationDelay(propagationDelay);
      }

      await network.reset(
        Number.isFinite(nodeCount) && nodeCount > 0 ? nodeCount : 3,
      );

      const nodes = network.listNodes();
      for (const node of nodes) {
        network.setDifficulty(node.id, difficulty);
        network.setMaxTransactionsPerBlock(node.id, 10);
      }
      network.setGossipFanout(2);
      network.resetMetrics();

      const states: Record<string, RlState> = {};
      for (const node of nodes) {
        states[node.id] = getNodeRlState(node.id);
      }

      return json({
        state: states,
        nodeCount: nodes.length,
      });
    }

    if (request.method === "POST" && pathname === "/rl/step") {
      const body = await readJson(request);
      const incomingTxs = toInt(Number(body.incomingTxs ?? 5), 0, 500);
      const actions = (body.actions ?? {}) as Record<string, NodeAction>;

      for (const node of network.listNodes()) {
        const nodeAction = actions[node.id] ?? {};
        if (
          nodeAction.difficulty !== undefined &&
          Number.isFinite(nodeAction.difficulty)
        ) {
          network.setDifficulty(node.id, toInt(nodeAction.difficulty, 1, 12));
        }
        if (
          nodeAction.maxTxsPerBlock !== undefined &&
          Number.isFinite(nodeAction.maxTxsPerBlock)
        ) {
          network.setMaxTransactionsPerBlock(
            node.id,
            toInt(nodeAction.maxTxsPerBlock, 1, 500),
          );
        }
        if (
          nodeAction.gossipFanout !== undefined &&
          Number.isFinite(nodeAction.gossipFanout)
        ) {
          const maxNeighbors = 5;
          const fanoutSize = Math.max(
            1,
            Math.round(nodeAction.gossipFanout * maxNeighbors),
          );
          network.setGossipFanout(fanoutSize);
        }
        if (
          nodeAction.propagationDelayMs !== undefined &&
          Number.isFinite(nodeAction.propagationDelayMs)
        ) {
          network.setPropagationDelay(
            toInt(nodeAction.propagationDelayMs, 0, 5000),
          );
        }
      }

      for (let i = 0; i < incomingTxs; i += 1) {
        const userId = `user-${(i % 8) + 1}`;
        const merchantId = `merchant-${(i % 5) + 1}`;
        network.submitTransaction(userId, merchantId, (i % 100) + 1);
      }

      const nodes = network.listNodes();
      for (const node of nodes) {
        if (node.pendingTxCount > 0) {
          try {
            await network.mine(node.id, `miner-${node.id}`);
          } catch {
            // skip if another node mined first
          }
        }
      }

      if (network.getState().propagationDelayMs > 0) {
        await new Promise((r) =>
          setTimeout(r, network.getState().propagationDelayMs * 2),
        );
      }

      const rewards: Record<string, number> = {};
      const states: Record<string, RlState> = {};

      for (const node of nodes) {
        const metrics = network.getNodeMetrics(node.id);
        const reward =
          metrics.txsConfirmed - FORK_PENALTY * metrics.forksDetected;
        rewards[node.id] = Math.round(reward * 1000) / 1000;
        states[node.id] = getNodeRlState(node.id);
      }

      return json({
        state: states,
        reward: rewards,
        metrics: {
          gossip: network.getGossipMetrics(),
          nodes: Object.fromEntries(
            nodes.map((n) => [n.id, network.getNodeMetrics(n.id)]),
          ),
        },
      });
    }

    return errorResponse("Not found", 404);
  },
});

console.log(`Node API listening on http://localhost:${port}`);
