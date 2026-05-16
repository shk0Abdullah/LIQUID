import { TransactionTabs } from './transaction-tabs'
import { TransactionOverview } from './transaction-overview'
import { RawDataDisplay } from './raw-data-display'
import type { TxRow, Block } from '@/types'

interface TransactionDetailsCardProps {
  transaction: TxRow
  block: Block
  confirmations: number
  txIndex: number
}

export function TransactionDetailsCard({
  transaction,
  block,
  confirmations,
  txIndex,
}: TransactionDetailsCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <TransactionTabs
        overview={
          <TransactionOverview
            transaction={transaction}
            block={block}
            confirmations={confirmations}
            txIndex={txIndex}
          />
        }
        rawData={<RawDataDisplay transaction={transaction} block={block} />}
      />
    </div>
  )
}
