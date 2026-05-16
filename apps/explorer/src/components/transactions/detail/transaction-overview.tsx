import Link from 'next/link'
import { Clock, ArrowRight, Gem } from 'lucide-react'
import { DetailRow } from './detail-row'
import { TransactionStatusBadge } from './transaction-status-badge'
import { AddressLink } from './address-link'
import { CopyButton } from './copy-button'
import { InputDataDisplay } from './input-data-display'
import { fmtTime, timeAgo, shortHash } from '@/lib/utils/format'
import type { TxRow, Block } from '@/types'

interface TransactionOverviewProps {
  transaction: TxRow
  block: Block
  confirmations: number
  txIndex: number
}

export function TransactionOverview({
  transaction,
  block,
  confirmations,
  txIndex,
}: TransactionOverviewProps) {
  const { id, from, to, amount, timestamp, signature, blockIndex, blockHash } = transaction
  const confirmationLabel = `${confirmations.toLocaleString()} Block Confirmation${confirmations !== 1 ? 's' : ''}`

  return (
    <div>
      {/* ── Group 1: Transaction Identity ── */}
      <DetailRow label="Transaction Hash">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-1.5">
          <span className="break-all font-mono text-sm leading-relaxed">{id}</span>
          <CopyButton value={id} />
        </div>
      </DetailRow>

      <DetailRow label="Status" alignItems="center">
        <div className="flex flex-wrap items-center gap-3">
          <TransactionStatusBadge status="success" />
          <span className="text-xs text-muted-foreground">{confirmationLabel}</span>
        </div>
      </DetailRow>

      <DetailRow label="Block" alignItems="center">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/blocks"
            className="font-mono text-sm text-primary underline-offset-2 hover:underline"
          >
            {blockIndex}
          </Link>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {confirmationLabel}
          </span>
        </div>
      </DetailRow>

      <DetailRow label="Timestamp" alignItems="center">
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium">{timeAgo(timestamp)}</span>
          <span className="text-muted-foreground">({fmtTime(timestamp)})</span>
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 2: Transfer ── */}
      <DetailRow label="From" alignItems="center">
        <AddressLink address={from} />
      </DetailRow>

      <DetailRow label="Interacted With (To)" alignItems="center">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </span>
          <AddressLink address={to} />
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 3: Value ── */}
      <DetailRow label="Value" alignItems="center">
        <span className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs">
          <Gem className="h-3 w-3 text-primary" />
          <span className="font-mono font-medium">{amount.toLocaleString()}</span>
          <span className="text-muted-foreground">LIQ</span>
        </span>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 4: Metadata ── */}
      <DetailRow label="Other Attributes" alignItems="center">
        <div className="flex flex-wrap gap-2">
          <AttributePill label="Txn Index" value={String(txIndex)} mono />
          <AttributePill label="Block Hash" value={shortHash(blockHash, 8)} mono title={blockHash} />
          <AttributePill label="Block Nonce" value={String(block.nonce)} mono />
        </div>
      </DetailRow>

      {/* ── Group separator ── */}
      <div className="border-b border-border pb-2 pt-2" />

      {/* ── Group 5: Signature ── */}
      <DetailRow label="Signature" noBorder>
        <InputDataDisplay data={signature} />
      </DetailRow>
    </div>
  )
}

function AttributePill({
  label,
  value,
  mono = false,
  title,
}: {
  label: string
  value: string
  mono?: boolean
  title?: string
}) {
  return (
    <span
      className="rounded border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground"
      title={title}
    >
      <span className="text-foreground/60">{label}:</span>{' '}
      <span className={mono ? 'font-mono font-medium text-foreground' : 'font-medium text-foreground'}>
        {value}
      </span>
    </span>
  )
}
