import { DataPanel } from '@/components/ui/data-panel'
import { AddressBadge } from '@/components/ui/address-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { timeAgo } from '@/lib/utils/format'
import type { TxRow } from '@/types'
import { ArrowLeftRight } from 'lucide-react'

export function LatestTxsTable({ txs }: { txs: TxRow[] }) {
  return (
    <DataPanel title="Latest Transactions" noPadding>
      {txs.length === 0 ? (
        <EmptyState icon={<ArrowLeftRight />} message="No transactions yet" className="py-12" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txs.slice(0, 6).map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <AddressBadge address={tx.from} variant="from" />
                </TableCell>
                <TableCell>
                  <AddressBadge address={tx.to} variant="to" />
                </TableCell>
                <TableCell className="font-mono text-[11px]">
                  {tx.amount.toLocaleString()}{' '}
                  <span className="text-muted-foreground">LIQ</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(tx.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  )
}
