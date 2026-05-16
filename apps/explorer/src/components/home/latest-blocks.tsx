'use client'

import Link from 'next/link'
import { Blocks, ArrowRight } from 'lucide-react'
import { timeAgo } from '@/lib/utils/format'
import type { Block } from '@/types'
import { StaggerList, StaggerItem } from '@/components/ui/stagger-list'

function truncHash(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export function LatestBlocks({ blocks }: { blocks: Block[] }) {
  const rows = blocks.slice(0, 6)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* Panel header */}
      <div className="border-b border-border bg-secondary px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Latest Blocks</h2>
          {rows.length > 0 && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-2xs font-medium text-white/70">
              {rows.length}
            </span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">No blocks mined yet</p>
        </div>
      ) : (
        <StaggerList className="divide-y divide-border">
          {rows.map((block) => (
            <StaggerItem key={block.hash}>
              <div className="group flex items-center gap-3.5 border-l-4 border-transparent px-4 py-3 transition-all hover:border-primary hover:bg-primary/5">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Blocks className="h-4 w-4 text-primary" />
                </div>

                {/* Block number + age */}
                <div className="w-[84px] shrink-0">
                  <Link
                    href="/blocks"
                    className="text-xs font-bold text-secondary hover:text-primary hover:underline"
                  >
                    #{block.index.toLocaleString()}
                  </Link>
                  <p className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    {timeAgo(block.timestamp)}
                  </p>
                </div>

                {/* Hash + txn sub-line */}
                <div className="hidden min-w-0 flex-1 sm:block">
                  <span
                    className="block truncate font-mono text-[10px] leading-none text-muted-foreground"
                    title={block.hash}
                  >
                    {truncHash(block.hash)}
                  </span>
                  <p className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    {block.transactions.length} txn{block.transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Txn count badge */}
                <div className="ml-auto shrink-0">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                    {block.transactions.length} txn{block.transactions.length !== 1 ? 's' : ''}
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
          href="/blocks"
          className="group flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          VIEW ALL BLOCKS
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
