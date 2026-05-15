import type { PageLoad } from "./$types";
import { apiJson } from "$lib/api";
import type { Block, NetworkState, Transaction } from "$lib/types";

type TxRow = Transaction & {
  blockHash: string;
  blockIndex: number;
};

export const load: PageLoad = async ({ fetch, url }) => {
  const nodeId = url.searchParams.get("nodeId") ?? "node-1";
  const [{ nodes }, chainRes] = await Promise.all([
    apiJson<NetworkState>(fetch, "network/state"),
    apiJson<{ nodeId: string; chain: Block[] }>(
      fetch,
      `chain?nodeId=${encodeURIComponent(nodeId)}`,
    ),
  ]);

  const chain = chainRes.chain ?? [];
  const txs: TxRow[] = [];
  for (const b of chain) {
    for (const t of b.transactions ?? []) {
      txs.push({ ...t, blockHash: b.hash, blockIndex: b.index });
    }
  }

  // Most recent first
  txs.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));

  return { nodeId, nodes, txs };
};

