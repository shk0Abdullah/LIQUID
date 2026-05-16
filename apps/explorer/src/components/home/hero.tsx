'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Blocks, ArrowLeftRight, Network } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { cn } from '@/lib/utils/cn'

const PLACEHOLDERS = [
  'Search by address…',
  'Search by transaction hash…',
  'Search by block number…',
  'Search by node ID…',
]

interface HeroProps {
  latestBlock?: number
  nodeCount?: number
  totalTxs?: number
}

function AnimatedPlaceholder() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const cycle = () => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % PLACEHOLDERS.length)
        setVisible(true)
      }, 350)
    }
    const id = setInterval(cycle, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className={cn(
        'pointer-events-none select-none transition-opacity duration-300',
        visible ? 'opacity-50' : 'opacity-0',
      )}
    >
      {PLACEHOLDERS[index]}
    </span>
  )
}

export function Hero({ latestBlock, nodeCount, totalTxs }: HeroProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  return (
    <section className="relative w-full overflow-hidden border-b border-border py-16 lg:py-24">
      {/* Dot grid background */}
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Animated blobs */}
      <div
        className="animate-blob pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="animate-blob animation-delay-2000 pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="animate-blob animation-delay-4000 pointer-events-none absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative mx-auto max-w-container px-4 lg:px-6">
        <FadeIn direction="up" delay={0}>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live Network Explorer
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.08}>
          <h1 className="text-4xl font-bold leading-tight text-secondary sm:text-5xl lg:text-6xl">
            The Liquid
            <br />
            <span className="gradient-text">Blockchain Explorer</span>
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.16}>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Explore blocks, transactions, and network nodes in real time on the Liquid network.
          </p>
        </FadeIn>

        {/* Search bar */}
        <FadeIn direction="up" delay={0.24}>
          <div
            className={cn(
              'mt-8 flex max-w-2xl overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-200',
              focused
                ? 'border-primary shadow-lg shadow-primary/10'
                : 'border-border hover:border-primary/40',
            )}
          >
            {/* Filter selector */}
            <button
              type="button"
              aria-label="Search filter"
              className="flex shrink-0 items-center gap-1.5 border-r border-border bg-muted/50 px-3.5 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              All Filters
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {/* Input */}
            <div className="relative flex min-w-0 flex-1 items-center">
              {!focused && (
                <span className="pointer-events-none absolute left-3.5 text-sm">
                  <AnimatedPlaceholder />
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder=""
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="h-full min-w-0 flex-1 bg-white px-3.5 py-3 text-sm text-foreground focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="button"
              aria-label="Search"
              className="flex shrink-0 items-center gap-2 bg-secondary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </FadeIn>

        {/* Mini stats strip */}
        {(latestBlock !== undefined || nodeCount !== undefined || totalTxs !== undefined) && (
          <FadeIn direction="up" delay={0.32}>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              {latestBlock !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Blocks className="h-3.5 w-3.5 text-primary" />
                  <span>Block <span className="font-semibold text-secondary">#{latestBlock.toLocaleString()}</span></span>
                </div>
              )}
              {nodeCount !== undefined && (
                <>
                  <span className="text-border">·</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Network className="h-3.5 w-3.5 text-primary" />
                    <span><span className="font-semibold text-secondary">{nodeCount}</span> active nodes</span>
                  </div>
                </>
              )}
              {totalTxs !== undefined && (
                <>
                  <span className="text-border">·</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
                    <span><span className="font-semibold text-secondary">{totalTxs.toLocaleString()}</span> transactions</span>
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
