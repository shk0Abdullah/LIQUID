import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTransaction } from '@/lib/api/chain'
import { TransactionDetailsCard } from '@/components/transactions/detail'

interface PageProps {
  params: Promise<{ hash: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hash } = await params
  const short = `${hash.slice(0, 10)}…`
  return {
    title: `Txn ${short} | Liquid Explorer`,
    description: `Transaction details for ${hash}`,
  }
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { hash } = await params

  const result = await getTransaction(hash)
  if (!result) notFound()

  const { transaction, block, totalBlocks, txIndex } = result
  // confirmations = how many blocks have been confirmed since this block (inclusive of the block itself)
  const confirmations = Math.max(1, totalBlocks - block.index)

  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/transactions" className="transition-colors hover:text-foreground">
          Transactions
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-foreground/80">Transaction Details</span>
      </nav>

      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-foreground">Transaction Details</h1>
      </div>

      {/* Main details card */}
      <TransactionDetailsCard
        transaction={transaction}
        block={block}
        confirmations={confirmations}
        txIndex={txIndex}
      />
    </div>
  )
}
