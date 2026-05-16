import type { NodeInfo } from '@/types'

interface NodeCardProps {
  node: NodeInfo
}

function NodeStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 p-3">
      <span className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold text-secondary">{value}</span>
    </div>
  )
}

export function NodeCard({ node }: NodeCardProps) {
  const shortHash = `${node.latestHash.slice(0, 14)}…${node.latestHash.slice(-6)}`

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Header strip — secondary dark navy */}
      <div className="flex items-center justify-between bg-secondary px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-xs font-bold text-white truncate">{node.id}</span>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-0.5 text-2xs font-semibold text-emerald-300">
          Online
        </span>
      </div>

      {/* Latest hash */}
      <div className="border-b border-border bg-muted/20 px-4 py-2.5">
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">Latest Hash</span>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground/80" title={node.latestHash}>
          {shortHash}
        </p>
      </div>

      {/* Stats 2×2 grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        <NodeStat label="Height" value={`#${node.height}`} />
        <NodeStat label="Mempool" value={node.pendingTxCount} />
        <NodeStat label="Difficulty" value={node.difficulty} />
        <NodeStat label="Peers" value={node.neighborCount} />
      </div>

      {/* Neighbors */}
      {node.neighbors.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            Connected to {node.neighborCount} {node.neighborCount === 1 ? 'peer' : 'peers'}
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {node.neighbors.map((n) => (
              <span
                key={n}
                className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-2xs font-medium text-primary"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
