import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getBlock } from '@/lib/api/chain'
import { BlockDetailsCard } from '@/components/blocks/detail'

interface PageProps {
  params: Promise<{ index: string }>
  searchParams: Promise<{ nodeId?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { index } = await params
  return {
    title: `Block #${index} | Liquid Explorer`,
    description: `Block details for block #${index}`,
  }
}

export default async function BlockDetailPage({ params, searchParams }: PageProps) {
  const { index } = await params
  const { nodeId = 'node-1' } = await searchParams

  const blockIndex = parseInt(index, 10)
  if (isNaN(blockIndex)) notFound()

  const result = await getBlock(nodeId, blockIndex)
  if (!result) notFound()

  const { block, totalBlocks, prevBlock, nextBlock } = result

  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1 text-xs text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/blocks" className="transition-colors hover:text-foreground">
          Blocks
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-foreground/80">Block #{block.index.toLocaleString()}</span>
      </nav>

      {/* Page title with prev/next navigation */}
      <div className="mb-5 flex items-center gap-2">
        {prevBlock && (
          <Link
            href={`/blocks/${prevBlock.index}?nodeId=${nodeId}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            title={`Previous block #${prevBlock.index}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
        <h1 className="text-lg font-semibold text-foreground">
          Block{' '}
          <span className="font-mono">#{block.index.toLocaleString()}</span>
        </h1>
        {nextBlock && (
          <Link
            href={`/blocks/${nextBlock.index}?nodeId=${nodeId}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            title={`Next block #${nextBlock.index}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Main details card */}
      <BlockDetailsCard
        block={block}
        totalBlocks={totalBlocks}
        prevBlock={prevBlock}
        nextBlock={nextBlock}
        nodeId={nodeId}
      />
    </div>
  )
}
