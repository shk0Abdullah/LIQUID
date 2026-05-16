import type { NodeInfo } from '@/types'

export function NodesTable({ nodes }: { nodes: NodeInfo[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Node</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Latest Hash</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Height</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mempool</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Peers</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr
              key={node.id}
              className="border-b border-border/50 transition-colors hover:bg-muted/20"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-mono font-medium text-foreground">{node.id}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-muted-foreground" title={node.latestHash}>
                  {node.latestHash.slice(0, 16)}…{node.latestHash.slice(-4)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono font-semibold text-primary">#{node.height}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{node.pendingTxCount}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-muted-foreground">{node.difficulty}</span>
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {node.neighborCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
