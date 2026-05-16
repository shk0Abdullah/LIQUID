import { getNetworkState } from '@/lib/api/network'
import { getChain } from '@/lib/api/chain'
import { Hero } from '@/components/home/hero'
import { StatsBanner } from '@/components/home/stats-banner'
import { LatestBlocks } from '@/components/home/latest-blocks'
import { LatestTxs } from '@/components/home/latest-txs'
import type { TxRow } from '@/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ nodeId?: string }>
}) {
  const { nodeId = 'node-1' } = await searchParams

  const [networkState, chainResponse] = await Promise.all([
    getNetworkState(),
    getChain(nodeId),
  ])

  const chain = chainResponse.chain ?? []
  const latestBlocks = [...chain].reverse().slice(0, 8)

  const latestTx: TxRow[] = latestBlocks
    .flatMap((b) =>
      b.transactions.map((t) => ({
        ...t,
        blockIndex: b.index,
        blockHash: b.hash,
      })),
    )
    .slice(0, 12)

  const totalTxs = chain.reduce((sum, b) => sum + b.transactions.length, 0)

  return (
    <>
      {/* Full-width hero — flush with navbar, no container padding */}
      <Hero
        latestBlock={latestBlocks[0]?.index}
        nodeCount={networkState.nodes.length}
        totalTxs={totalTxs}
      />

      {/* Full-width stats strip */}
      <StatsBanner
        latestBlock={latestBlocks[0]}
        nodes={networkState.nodes}
        totalTxs={totalTxs}
      />

      {/* Contained two-column table section */}
      <div className="mx-auto max-w-container px-4 py-6 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <LatestBlocks blocks={latestBlocks} />
          <LatestTxs txs={latestTx} />
        </div>
      </div>
    </>
  )
}
