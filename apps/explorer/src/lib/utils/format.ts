export function shortHash(hash: string, take = 10): string {
  if (hash.length <= take + 4) return hash
  return `${hash.slice(0, take)}…${hash.slice(-4)}`
}

export function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}
