import type { TxRow, Block } from '@/types'

interface RawDataDisplayProps {
  transaction: TxRow
  block: Block
}

export function RawDataDisplay({ transaction, block }: RawDataDisplayProps) {
  const payload = {
    transaction: {
      id: transaction.id,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      signature: transaction.signature ?? null,
    },
    block: {
      index: block.index,
      hash: block.hash,
      previousHash: block.previousHash,
      nonce: block.nonce,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
    },
  }

  return (
    <div className="py-4">
      <pre className="max-h-[480px] overflow-auto rounded-md border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  )
}
