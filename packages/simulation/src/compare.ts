const BASE_URL = "http://localhost:3000";

async function post(path: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    signal: AbortSignal.timeout(10_000),
  });
  return res.json();
}

async function experiment(
  label: string,
  maxTxs: number,
  difficulty: number,
  txCount: number,
) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `${label}: maxTxs=${maxTxs}, difficulty=${difficulty}, txs=${txCount}`,
  );
  console.log("=".repeat(60));

  await post("/rl/reset", { nodeCount: 3, difficulty });

  for (const nodeId of ["node-1", "node-2", "node-3"]) {
    await post("/network/config", { nodeId, maxTxsPerBlock: maxTxs });
  }

  for (let i = 0; i < txCount; i++) {
    await post("/transactions", {
      from: `user-${(i % 8) + 1}`,
      to: `merchant-${(i % 5) + 1}`,
      amount: (i % 100) + 1,
    });
  }

  for (let i = 0; i < 5; i++) {
    const nodeId = `node-${(i % 3) + 1}`;
    try {
      const result = await post("/mine", {
        nodeId,
        minerAddress: `miner-${i + 1}`,
      });
      console.log(`  ${nodeId} mined block #${result.height}`);
    } catch {
      console.log(`  ${nodeId} mining skipped`);
    }
  }

  const state = await get("/network/state");
  console.log(`\nResults:`);
  for (const node of state.nodes) {
    console.log(
      `  ${node.id}: height=${node.height}, pending=${node.pendingTxCount}, ` +
        `confirmed=${node.metrics.txsConfirmed}, forks=${node.metrics.forksDetected}, ` +
        `blockUtil=${(node.metrics.blockUtilization * 100).toFixed(0)}%`,
    );
  }

  const chain = (await get(`/chain?nodeId=node-1`)).chain;
  console.log(`\nBlock contents (node-1):`);
  for (const block of chain.slice(1)) {
    const nonRewardTxs = block.transactions.filter(
      (t: { from: string }) => t.from !== "SYSTEM",
    ).length;
    console.log(
      `  Block #${block.index}: ${nonRewardTxs} user txs + 1 reward = ${block.transactions.length} total`,
    );
  }

  const totalConfirmed = state.nodes.reduce(
    (s: number, n: { metrics: { txsConfirmed: number } }) =>
      s + n.metrics.txsConfirmed,
    0,
  );
  const totalPending = state.nodes.reduce(
    (s: number, n: { pendingTxCount: number }) => s + n.pendingTxCount,
    0,
  );
  return { totalConfirmed, totalPending };
}

async function main() {
  const health = await fetch(`${BASE_URL}/health`, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!health.ok) {
    console.error("Server not running");
    process.exit(1);
  }

  const r1 = await experiment("BEFORE (Static, maxTxs=10)", 10, 2, 50);
  const r2 = await experiment("AFTER (RL-like, maxTxs=50)", 50, 2, 50);
  const r3 = await experiment("HIGH TRAFFIC (Static, maxTxs=10)", 10, 2, 200);
  const r4 = await experiment(
    "HIGH TRAFFIC (RL-like, maxTxs=100)",
    100,
    2,
    200,
  );

  console.log(`\n${"=".repeat(60)}`);
  console.log("COMPARISON SUMMARY");
  console.log("=".repeat(60));
  console.log(
    `  50 txs,  maxTxs=10:  confirmed=${r1.totalConfirmed}, pending=${r1.totalPending}`,
  );
  console.log(
    `  50 txs,  maxTxs=50:  confirmed=${r2.totalConfirmed}, pending=${r2.totalPending}`,
  );
  console.log(
    `  200 txs, maxTxs=10:  confirmed=${r3.totalConfirmed}, pending=${r3.totalPending}`,
  );
  console.log(
    `  200 txs, maxTxs=100: confirmed=${r4.totalConfirmed}, pending=${r4.totalPending}`,
  );
}

main().catch(console.error);
