'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const FILTER_OPTIONS = [
  'All Filters',
  'Addresses',
  'Tokens',
  'Blocks',
  'Transactions',
  'Domain Names',
] as const

type FilterOption = (typeof FILTER_OPTIONS)[number]

export function NavSearch() {
  const [filter, setFilter] = useState<FilterOption>('All Filters')
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return
    function onPointerDown(e: PointerEvent) {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [filterOpen])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Search handler: extend as needed
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center"
      role="search"
      aria-label="Blockchain search"
    >
      <div className="relative flex h-9 w-full overflow-visible rounded-md border border-border bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30">
        {/* Filter selector */}
        <div ref={filterRef} className="relative flex-none">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            className="flex h-full items-center gap-1 border-r border-border px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="hidden min-w-[72px] text-left sm:block">{filter}</span>
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-150', filterOpen ? 'rotate-180' : '')}
              aria-hidden="true"
            />
          </button>

          {filterOpen && (
            <div
              role="listbox"
              aria-label="Search filter"
              className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[160px] rounded-md border border-border bg-card py-1 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
            >
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={filter === option}
                  onClick={() => {
                    setFilter(option)
                    setFilterOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center px-4 py-[7px] text-[13px] transition-colors hover:bg-accent hover:text-foreground',
                    filter === option ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Address / Txn Hash / Block / Token"
          className="min-w-0 flex-1 bg-transparent px-3 text-[12.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          aria-label="Search query"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Search button */}
        <button
          type="submit"
          aria-label="Search"
          className="flex h-full flex-none items-center justify-center rounded-r-[5px] bg-primary px-3.5 text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          <Search className="h-[13px] w-[13px]" aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
