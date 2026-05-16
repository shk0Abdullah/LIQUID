import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'
import { timeAgo, fmtTime } from '@/lib/utils/format'
import type { TxRow } from '@/types'

function TruncAddr({ address, variant }: { address: string; variant?: 'from' | 'to' }) {
  const truncated = `${address.slice(0, 10)}…${address.slice(-6)}`
  const colorClass =
    variant === 'from'
      ? 'text-amber-600'
      : variant === 'to'
        ? 'text-emerald-600'
        : 'text-muted-foreground'
  return (
    <span className={`font-mono text-xs ${colorClass}`} title={address}>
      {truncated}
    </span>
  )
}

function TruncId({ id }: { id: string }) {
  const truncated = `${id.slice(0, 10)}…${id.slice(-6)}`
  return (
    <span className="font-mono text-xs font-semibold text-secondary" title={id}>
      {truncated}
    </span>
  )
}

export function TxsTable({ txs }: { txs: TxRow[] }) {
  if (txs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ArrowLeftRight className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No transactions found</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Submit a transaction to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/5">
              <th className="px-4 py-3 text-left font-semibold text-secondary">Txn Hash</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Block</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Age</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">From</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary"></th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">To</th>
              <th className="px-4 py-3 text-right font-semibold text-secondary">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr
                key={tx.id}
                className="group/row border-b border-border/50 transition-colors hover:bg-primary/5 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <TruncId id={tx.id} />
                </td>
                <td className="px-4 py-3">
                  <Link href="/blocks">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-primary hover:bg-primary/20 transition-colors cursor-pointer">
                      #{tx.blockIndex}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="cursor-default text-muted-foreground" title={fmtTime(tx.timestamp)}>
                    {timeAgo(tx.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TruncAddr address={tx.from} variant="from" />
                </td>
                <td className="px-4 py-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                    →
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TruncAddr address={tx.to} variant="to" />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono font-medium text-secondary">
                    {tx.amount.toLocaleString()}{' '}
                    <span className="text-muted-foreground">LIQ</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
