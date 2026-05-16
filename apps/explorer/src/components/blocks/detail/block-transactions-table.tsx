import Link from 'next/link'
import { Layers } from 'lucide-react'
import { timeAgo, fmtTime } from '@/lib/utils/format'
import type { Transaction } from '@/types'

function truncAddr(addr: string) {
  if (addr.length <= 16) return addr
  return `${addr.slice(0, 10)}…${addr.slice(-6)}`
}

function truncHash(hash: string) {
  if (hash.length <= 18) return hash
  return `${hash.slice(0, 12)}…${hash.slice(-6)}`
}

interface BlockTransactionsTableProps {
  transactions: Transaction[]
}

export function BlockTransactionsTable({ transactions }: BlockTransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Layers className="mb-3 h-7 w-7 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No transactions in this block</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Txn Hash</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Age</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">From</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">To</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-border/50 transition-colors hover:bg-muted/20"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/transactions/${tx.id}`}
                  className="font-mono text-primary underline-offset-2 hover:underline"
                  title={tx.id}
                >
                  {truncHash(tx.id)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span
                  className="cursor-default text-muted-foreground"
                  title={fmtTime(tx.timestamp)}
                >
                  {timeAgo(tx.timestamp)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-orange-400" title={tx.from}>
                  {truncAddr(tx.from)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-emerald-400" title={tx.to}>
                  {truncAddr(tx.to)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono text-foreground">
                  {tx.amount.toLocaleString()}
                </span>
                <span className="ml-1 text-muted-foreground">LIQ</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
