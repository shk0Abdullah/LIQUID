import Link from 'next/link'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { DetailRow } from '@/components/transactions/detail/detail-row'
import { CopyButton } from '@/components/transactions/detail/copy-button'
import { BlockStatusBadge } from './block-status-badge'
import { fmtTime, timeAgo } from '@/lib/utils/format'
import type { Block } from '@/types'

interface BlockOverviewProps {
  block: Block
  totalBlocks: number
  prevBlock: Block | null
  nextBlock: Block | null
  nodeId: string
}

export function BlockOverview({
  block,
  totalBlocks,
  prevBlock,
  nextBlock,
  nodeId,
}: BlockOverviewProps) {
  const confirmations = Math.max(1, totalBlocks - block.index)
  const confirmationLabel = `${confirmations.toLocaleString()} Block Confirmation${confirmations !== 1 ? 's' : ''}`

  return (
    <div>
      {/* ── Group 1: Block Identity ── */}
      <DetailRow label="Block Height" alignItems="center">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-semibold text-foreground">
            {block.index.toLocaleString()}
          </span>
          {prevBlock !== null && (
            <Link
              href={`/blocks/${prevBlock.index}?nodeId=${nodeId}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              title={`Previous block #${prevBlock.index}`}
            >
              <ChevronLeft className="h-3 w-3" />
            </Link>
          )}
          {nextBlock !== null && (
            <Link
              href={`/blocks/${nextBlock.index}?nodeId=${nodeId}`}
              className="inline-flex h-5 w-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              title={`Next block #${nextBlock.index}`}
            >
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </DetailRow>

      <DetailRow label="Status" alignItems="center">
        <div className="flex flex-wrap items-center gap-3">
          <BlockStatusBadge status="confirmed" />
          <span className="text-xs text-muted-foreground">{confirmationLabel}</span>
        </div>
      </DetailRow>

      <DetailRow label="Timestamp" alignItems="center">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium">{timeAgo(block.timestamp)}</span>
          <span className="text-muted-foreground">({fmtTime(block.timestamp)})</span>
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 2: Transactions ── */}
      <DetailRow label="Transactions" alignItems="center">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Link
            href={`/transactions?nodeId=${nodeId}`}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {block.transactions.length} transaction{block.transactions.length !== 1 ? 's' : ''}
          </Link>
          <span className="text-muted-foreground">in this block</span>
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 3: Hashes ── */}
      <DetailRow label="Hash">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-1.5">
          <span className="break-all font-mono text-sm leading-relaxed">{block.hash}</span>
          <CopyButton value={block.hash} />
        </div>
      </DetailRow>

      <DetailRow label="Parent Hash">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-1.5">
          {prevBlock ? (
            <Link
              href={`/blocks/${prevBlock.index}?nodeId=${nodeId}`}
              className="break-all font-mono text-sm text-primary underline-offset-2 hover:underline"
            >
              {block.previousHash}
            </Link>
          ) : (
            <span className="break-all font-mono text-sm text-muted-foreground">
              {block.previousHash}
            </span>
          )}
          <CopyButton value={block.previousHash} />
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 4: Mining Metadata ── */}
      <DetailRow label="Nonce" alignItems="center" noBorder>
        <span className="font-mono text-sm">{block.nonce.toLocaleString()}</span>
      </DetailRow>
    </div>
  )
}
