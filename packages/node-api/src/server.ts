import { BlockchainNetwork } from "./network.js";

const port = Number(process.env.PORT ?? 4000);
const network = await BlockchainNetwork.create(3);

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
      await network.reset(Number.isFinite(nodeCount) && nodeCount > 0 ? nodeCount : 3);
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
        return errorResponse(error instanceof Error ? error.message : "Mining failed", 404);
      }
    }

    if (request.method === "GET" && pathname === "/chain") {
      const nodeId = url.searchParams.get("nodeId") ?? "node-1";
      try {
        return json({ nodeId, chain: network.getNodeChain(nodeId) });
      } catch (error) {
        return errorResponse(error instanceof Error ? error.message : "Node not found", 404);
      }
    }

    if (request.method === "POST" && pathname === "/rl/reset") {
      const body = await readJson(request);
      const nodeCount = Number(body.nodeCount ?? 3);
      const difficulty = Number(body.difficulty ?? 2);
      await network.reset(Number.isFinite(nodeCount) && nodeCount > 0 ? nodeCount : 3);
      network.setDifficultyForAll(Number.isFinite(difficulty) && difficulty > 0 ? difficulty : 2);
      return json(network.getState());
    }

    if (request.method === "POST" && pathname === "/rl/step") {
      const body = await readJson(request);
      const nodeId = String(body.nodeId ?? "node-1");
      const minerAddress = String(body.minerAddress ?? "miner-1");
      const difficultyDelta = Number(body.difficultyDelta ?? 0);
      const txCount = Number(body.txCount ?? 1);

      const stateBefore = network.getState();
      const baseDifficulty = stateBefore.nodes[0]?.difficulty ?? 2;
      const nextDifficulty = Math.max(1, baseDifficulty + difficultyDelta);
      network.setDifficultyForAll(nextDifficulty);

      for (let i = 0; i < txCount; i += 1) {
        network.submitTransaction(`user-${i + 1}`, `merchant-${i + 1}`, i + 1);
      }

      const mineResult = await network.mine(nodeId, minerAddress);
      const stateAfter = network.getState();
      const confirmedTx = Math.max(0, txCount - mineResult.pendingTxCount);
      const backlogPenalty = stateAfter.avgPendingTxCount;
      const difficultyPenalty = Math.abs(nextDifficulty - 2) * 0.25;
      const reward = confirmedTx - backlogPenalty - difficultyPenalty;

      return json({
        state: stateAfter,
        reward,
        info: {
          confirmedTx,
          backlogPenalty,
          difficultyPenalty,
          minedHash: mineResult.hash,
        },
      });
    }

    return errorResponse("Not found", 404);
  },
});

console.log(`Node API listening on http://localhost:${port}`);
