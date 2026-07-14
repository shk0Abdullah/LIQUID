const API = process.env.API_URL ?? "http://localhost:3000";

const USERS = [
  "alice",
  "bob",
  "charlie",
  "dave",
  "eve",
  "frank",
  "grace",
  "heidi",
  "ivan",
  "judy",
];
const MERCHANTS = ["amazon", "coinbase", "stripe", "binance", "shopify"];
const RESET = process.argv.includes("--reset");
const TX_COUNT = Number(process.env.TX_COUNT ?? 20);
const BLOCK_COUNT = Number(process.env.BLOCK_COUNT ?? 3);
const DELAY = Number(process.env.DELAY_MS ?? 0);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function post(path: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  return res.json();
}

async function seed() {
  const health = await fetch(`${API}/health`, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!health.ok) {
    console.error(`Server not running at ${API}`);
    console.error("Start it first: cd packages/node-api && bun run dev");
    process.exit(1);
  }

  if (RESET) {
    console.log("Resetting network...");
    const resetBody: Record<string, unknown> = { nodeCount: 3 };
    if (DELAY > 0) resetBody.propagationDelayMs = DELAY;
    await post("/network/reset", resetBody);
  } else if (DELAY > 0) {
    await post("/rl/reset", {
      nodeCount: 3,
      difficulty: 2,
      propagationDelayMs: DELAY,
    });
  }

  const state = await (await fetch(`${API}/network/state`)).json();
  console.log(
    `Network: ${state.nodeCount} nodes, height ${state.maxHeight}, delay=${state.propagationDelayMs ?? 0}ms`,
  );

  console.log(`Submitting ${TX_COUNT} transactions...`);
  for (let i = 0; i < TX_COUNT; i++) {
    const from = pick(USERS);
    const to = pick(MERCHANTS);
    const amount = randAmount(1, 500);
    await post("/transactions", { from, to, amount });
    console.log(`  tx ${i + 1}: ${from} -> ${to} (${amount})`);
  }

  console.log(`Mining ${BLOCK_COUNT} blocks...`);
  for (let i = 0; i < BLOCK_COUNT; i++) {
    const nodeId = `node-${(i % state.nodeCount) + 1}`;
    const result = await post("/mine", {
      nodeId,
      minerAddress: `miner-${i + 1}`,
    });
    console.log(`  ${nodeId} mined block ${result.height}`);
  }

  if (DELAY > 0) {
    console.log(`Waiting for gossip propagation (${DELAY * 2}ms)...`);
    await new Promise((r) => setTimeout(r, DELAY * 2));
  }

  const finalState = await (await fetch(`${API}/network/state`)).json();
  const totalForks = finalState.nodes.reduce(
    (s: number, n: { metrics: { forksDetected: number } }) =>
      s + n.metrics.forksDetected,
    0,
  );
  const totalTxs = finalState.nodes.reduce(
    (s: number, n: { metrics: { txsConfirmed: number } }) =>
      s + n.metrics.txsConfirmed,
    0,
  );
  console.log(
    `\nDone! ${finalState.nodeCount} nodes, height ${finalState.maxHeight}, ${finalState.avgPendingTxCount.toFixed(1)} avg pending`,
  );
  console.log(`  Forks detected: ${totalForks}`);
  console.log(`  Txs confirmed: ${totalTxs}`);
  console.log(
    `  Gossip: sent=${finalState.gossipMetrics.messagesSent}, deduped=${finalState.gossipMetrics.messagesDeduped}`,
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
