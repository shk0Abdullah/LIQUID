import { BlockTabs } from './block-tabs'
import { BlockOverview } from './block-overview'
import { BlockTransactionsTable } from './block-transactions-table'
import type { Block } from '@/types'

interface BlockDetailsCardProps {
  block: Block
  totalBlocks: number
  prevBlock: Block | null
  nextBlock: Block | null
  nodeId: string
}

export function BlockDetailsCard({
  block,
  totalBlocks,
  prevBlock,
  nextBlock,
  nodeId,
}: BlockDetailsCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <BlockTabs
        txCount={block.transactions.length}
        overview={
          <BlockOverview
            block={block}
            totalBlocks={totalBlocks}
            prevBlock={prevBlock}
            nextBlock={nextBlock}
            nodeId={nodeId}
          />
        }
        transactions={<BlockTransactionsTable transactions={block.transactions} />}
      />
    </div>
  )
}
