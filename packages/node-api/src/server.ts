import { BlockchainNetwork } from "./network.js";

const port = Number(process.env.PORT ?? 3000);
const network = await BlockchainNetwork.create(3);
const RL_TICK_MS = 1000;

interface RlState {
  incoming_txs: number;
  mempool_size: number;
  current_tps: number;
  network_delay: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toInt(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}

function buildRlState(
  incomingTxs: number,
  currentTps: number,
  networkDelay: number,
): RlState {
  const primaryNode = network.getNodeInfo("node-1");
  return {
    incoming_txs: incomingTxs,
    mempool_size: primaryNode.pendingTxCount,
    current_tps: currentTps,
    network_delay: networkDelay,
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

Bun.serve({
  port,
  async fetch(request) {
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

    if (request.method === "POST" && pathname === "/rl/reset") {
      const body = await readJson(request);
      const nodeCount = Number(body.nodeCount ?? 3);
      const difficulty = Number(body.difficulty ?? 2);
      await network.reset(
        Number.isFinite(nodeCount) && nodeCount > 0 ? nodeCount : 3,
      );
      network.setDifficultyForAll(
        Number.isFinite(difficulty) && difficulty > 0 ? difficulty : 2,
      );
      network.setMaxTransactionsPerBlockForAll(10);
      return json({
        state: buildRlState(0, 0, 50),
      });
    }

    if (request.method === "POST" && pathname === "/rl/step") {
      const body = await readJson(request);
      const nodeId = String(body.nodeId ?? "node-1");
      const minerAddress = String(body.minerAddress ?? "miner-1");
      const incomingTxs = toInt(Number(body.incomingTxs ?? 1), 0, 500);
      const actionDifficulty = toInt(Number(body.difficulty ?? 2), 1, 12);
      const actionMaxTxsPerBlock = toInt(
        Number(body.maxTxsPerBlock ?? 10),
        1,
        500,
      );
      const actionGossipFanout = clamp(Number(body.gossipFanout ?? 0.5), 0, 1);
      const actionMineIntervalMs = toInt(
        Number(body.mineIntervalMs ?? 1000),
        100,
        10_000,
      );

      network.setDifficultyForAll(actionDifficulty);
      network.setMaxTransactionsPerBlockForAll(actionMaxTxsPerBlock);

      const beforePending = network.getNodeInfo(nodeId).pendingTxCount;
      for (let i = 0; i < incomingTxs; i += 1) {
        network.submitTransaction(`user-${i + 1}`, `merchant-${i + 1}`, i + 1);
      }

      let minedHash = "";
      const mineProbability = clamp(RL_TICK_MS / actionMineIntervalMs, 0, 1);
      if (Math.random() <= mineProbability) {
        const mineResult = await network.mine(nodeId, minerAddress);
        minedHash = mineResult.hash;
      }

      const afterPending = network.getNodeInfo(nodeId).pendingTxCount;
      const confirmedTx = Math.max(
        0,
        beforePending + incomingTxs - afterPending,
      );
      const currentTps = confirmedTx / (RL_TICK_MS / 1000);

      const baseDelay = 20;
      const queueDelay = afterPending * 2;
      const fanoutDelay = actionGossipFanout * 80;
      const networkDelay = baseDelay + queueDelay + fanoutDelay;

      const invalidMessageRate = clamp(
        0.02 +
          0.005 * Math.max(0, actionDifficulty - 4) +
          0.001 * actionMaxTxsPerBlock,
        0,
        1,
      );
      const droppedMessageRate = clamp(
        0.01 +
          (incomingTxs / Math.max(1, actionMaxTxsPerBlock)) * 0.1 +
          actionGossipFanout * 0.05,
        0,
        1,
      );
      const timeoutRate = clamp(
        0.01 + networkDelay / 2000 + actionMineIntervalMs / 20000,
        0,
        1,
      );

      const reward =
        currentTps - (invalidMessageRate + droppedMessageRate + timeoutRate);

      return json({
        state: buildRlState(incomingTxs, currentTps, networkDelay),
        reward,
        info: {
          confirmedTxs: confirmedTx,
          invalid_message_rate: invalidMessageRate,
          dropped_message_rate: droppedMessageRate,
          timeout_rate: timeoutRate,
          applied_action: {
            difficulty: actionDifficulty,
            maxTxsPerBlock: actionMaxTxsPerBlock,
            gossipFanout: actionGossipFanout,
            mineIntervalMs: actionMineIntervalMs,
          },
          minedHash,
        },
      });
    }

    return errorResponse("Not found", 404);
  },
});

console.log(`Node API listening on http://localhost:${port}`);
