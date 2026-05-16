import Link from 'next/link'
import { DataPanel } from '@/components/ui/data-panel'
import { HashDisplay } from '@/components/ui/hash-display'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { timeAgo } from '@/lib/utils/format'
import type { Block } from '@/types'
import { Blocks } from 'lucide-react'

export function LatestBlocksTable({ blocks }: { blocks: Block[] }) {
  return (
    <DataPanel title="Latest Blocks" noPadding>
      {blocks.length === 0 ? (
        <EmptyState icon={<Blocks />} message="No blocks yet" className="py-12" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Block</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>Txns</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.slice(0, 6).map((block) => (
              <TableRow key={block.hash}>
                <TableCell>
                  <Link
                    href={`/blocks`}
                    className="font-mono text-[11px] font-medium text-primary hover:underline"
                  >
                    #{block.index}
                  </Link>
                </TableCell>
                <TableCell>
                  <HashDisplay hash={block.hash} take={10} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {block.transactions.length}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(block.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  )
}
