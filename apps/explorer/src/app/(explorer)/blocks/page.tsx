import { getNetworkState } from '@/lib/api/network'
import { getChain } from '@/lib/api/chain'
import { NodeTabs } from '@/components/ui/node-tabs'
import { BlocksTable } from '@/components/blocks/blocks-table'

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ nodeId?: string }>
}) {
  const { nodeId = 'node-1' } = await searchParams

  const [networkState, chainResponse] = await Promise.all([
    getNetworkState(),
    getChain(nodeId),
  ])

  const blocks = [...(chainResponse.chain ?? [])].reverse()

  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-foreground">Blocks</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {blocks.length.toLocaleString()} block{blocks.length !== 1 ? 's' : ''} on{' '}
          <span className="font-mono">{nodeId}</span>
        </p>
      </div>

      {/* Node selector */}
      <NodeTabs nodes={networkState.nodes} activeNodeId={nodeId} basePath="/blocks" />

      {/* Table panel */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            A total of{' '}
            <span className="font-semibold text-foreground">
              {blocks.length.toLocaleString()}
            </span>{' '}
            block{blocks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <BlocksTable blocks={blocks} nodeId={nodeId} />
      </div>
    </div>
  )
}
