import type { PageLoad } from "./$types";
import { apiJson } from "$lib/api";
import type { NetworkState } from "$lib/types";

export const load: PageLoad = async ({ fetch }) => {
  const state = await apiJson<NetworkState>(fetch, "network/state");
  return { nodes: state.nodes ?? [] };
};

