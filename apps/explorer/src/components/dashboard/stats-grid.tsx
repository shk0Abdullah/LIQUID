import { Blocks, Users, ArrowLeftRight, Wifi } from 'lucide-react'
import { StatCard } from './stat-card'
import type { Block, NodeInfo } from '@/types'

interface StatsGridProps {
  latestBlocks: Block[]
  nodes: NodeInfo[]
  txCount: number
}

export function StatsGrid({ latestBlocks, nodes, txCount }: StatsGridProps) {
  const latestBlock = latestBlocks[0]
  const difficulty = nodes[0]?.difficulty

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Latest Block"
        value={latestBlock ? `#${latestBlock.index}` : '—'}
        meta={latestBlock ? `${latestBlock.transactions.length} txns` : undefined}
        icon={<Blocks />}
        accent="blue"
      />
      <StatCard
        label="Active Nodes"
        value={nodes.length}
        meta={nodes.length > 0 ? 'All online' : undefined}
        icon={<Users />}
        accent="green"
      />
      <StatCard
        label="Transactions"
        value={txCount}
        meta="Last 8 blocks"
        icon={<ArrowLeftRight />}
        accent="purple"
      />
      <StatCard
        label="Network"
        value="Live"
        meta={difficulty != null ? `Difficulty ${difficulty}` : undefined}
        icon={<Wifi />}
        accent="cyan"
      />
    </div>
  )
}
