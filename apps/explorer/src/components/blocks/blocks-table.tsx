import Link from 'next/link'
import { Blocks } from 'lucide-react'
import { timeAgo, fmtTime, formatNumber } from '@/lib/utils/format'
import type { Block } from '@/types'

function TruncHash({ hash, len = 14 }: { hash: string; len?: number }) {
  const truncated = hash.length > len + 6 ? `${hash.slice(0, len)}…${hash.slice(-4)}` : hash
  return (
    <span className="font-mono text-xs text-muted-foreground transition-colors group-hover/row:text-foreground" title={hash}>
      {truncated}
    </span>
  )
}

export function BlocksTable({ blocks, nodeId = 'node-1' }: { blocks: Block[]; nodeId?: string }) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Blocks className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No blocks found</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Mine a block to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/5">
              <th className="px-4 py-3 text-left font-semibold text-secondary">Block</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Age</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Txns</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Hash</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Parent Hash</th>
              <th className="px-4 py-3 text-right font-semibold text-secondary">Nonce</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr
                key={block.hash}
                className="group/row border-b border-border/50 transition-colors hover:bg-primary/5 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/blocks/${block.index}?nodeId=${nodeId}`}
                    className="font-mono font-bold text-secondary underline-offset-2 hover:text-primary hover:underline"
                  >
                    #{block.index}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="cursor-default text-muted-foreground" title={fmtTime(block.timestamp)}>
                    {timeAgo(block.timestamp)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-primary">
                    {block.transactions.length}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TruncHash hash={block.hash} />
                </td>
                <td className="px-4 py-3">
                  <TruncHash hash={block.previousHash} len={12} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-muted-foreground">{formatNumber(block.nonce)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
