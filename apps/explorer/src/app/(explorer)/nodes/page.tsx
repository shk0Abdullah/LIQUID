import { getNetworkState } from '@/lib/api/network'
import { NodesGrid } from '@/components/nodes/nodes-grid'
import { NodesTable } from '@/components/nodes/nodes-table'

export default async function NodesPage() {
  const { nodes } = await getNetworkState()

  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-foreground">Nodes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {nodes.length.toLocaleString()} node{nodes.length !== 1 ? 's' : ''} in the network
        </p>
      </div>

      {/* Node cards */}
      <NodesGrid nodes={nodes} />

      {/* Summary table */}
      {nodes.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Node Summary</h2>
          </div>
          <NodesTable nodes={nodes} />
        </div>
      )}
    </div>
  )
}
