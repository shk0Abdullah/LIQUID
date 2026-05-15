export async function apiJson<T>(
  fetchFn: typeof fetch,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetchFn(`/api/${path.replace(/^\/+/, "")}`, init);
  const text = await res.text();
  const data = text.length ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "error" in data &&
        (data as any).error) ||
      `Request failed: ${res.status}`;
    throw new Error(String(message));
  }
  return data as T;
}

export function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function shortHash(hash: string, take = 10): string {
  if (!hash) return "";
  if (hash.length <= take + 4) return hash;
  return `${hash.slice(0, take)}…${hash.slice(-4)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
