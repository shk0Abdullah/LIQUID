'use client'

import Link from 'next/link'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'
import { timeAgo } from '@/lib/utils/format'
import type { TxRow } from '@/types'
import { StaggerList, StaggerItem } from '@/components/ui/stagger-list'

function truncAddr(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-4)}`
}

export function LatestTxs({ txs }: { txs: TxRow[] }) {
  const rows = txs.slice(0, 6)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* Panel header */}
      <div className="border-b border-border bg-secondary px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Latest Transactions</h2>
          {rows.length > 0 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-2xs font-medium text-white/70">
              {rows.length}
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <StaggerList className="divide-y divide-border">
          {rows.map((tx) => (
            <StaggerItem key={tx.id}>
              <div className="group flex items-center gap-3.5 border-l-4 border-transparent px-4 py-3 transition-all hover:border-primary hover:bg-primary/5">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                </div>

                {/* Hash + age */}
                <div className="w-[84px] shrink-0">
                  <Link
                    href="/transactions"
                    className="block truncate font-mono text-xs font-bold text-secondary hover:text-primary hover:underline"
                    title={tx.id}
                  >
                    {truncAddr(tx.id)}
                  </Link>
                  <p className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    {timeAgo(tx.timestamp)}
                  </p>
                </div>

                {/* From → To */}
                <div className="hidden min-w-0 flex-1 sm:block">
                  <div className="flex items-baseline gap-1">
                    <span className="shrink-0 text-[10px] text-muted-foreground">From</span>
                    <span className="truncate font-mono text-[10px] text-foreground/80" title={tx.from}>
                      {truncAddr(tx.from)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="shrink-0 text-[10px] text-muted-foreground">To</span>
                    <span className="truncate font-mono text-[10px] text-foreground/80" title={tx.to}>
                      {truncAddr(tx.to)}
                    </span>
                  </div>
                </div>

                {/* Amount badge */}
                <div className="ml-auto shrink-0">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                    {tx.amount.toLocaleString()} LIQ
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {/* View all link */}
      <div className="mt-auto border-t border-border">
        <Link
          href="/transactions"
          className="group flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          VIEW ALL TRANSACTIONS
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
