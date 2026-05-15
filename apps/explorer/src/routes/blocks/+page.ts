import type { PageLoad } from "./$types";
import { apiJson } from "$lib/api";
import type { Block, NetworkState } from "$lib/types";

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
  const blocks = [...chain].reverse();

  return { nodeId, nodes, blocks };
};

