'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface BlockTabsProps {
  overview: ReactNode
  transactions: ReactNode
  txCount: number
}

export function BlockTabs({ overview, transactions, txCount }: BlockTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')

  const TABS = [
    { id: 'overview', label: 'Overview', count: undefined },
    { id: 'transactions', label: 'Transactions', count: txCount },
  ]

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-end gap-0 border-b border-border px-4 sm:px-5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex h-12 items-center gap-1.5 px-4 text-sm font-medium',
                'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isActive
                  ? [
                      'text-foreground',
                      'after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-t-full after:bg-primary after:content-[""]',
                    ]
                  : 'text-muted-foreground hover:text-foreground/80',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
                    isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content — overview gets side padding; transactions table extends full-width */}
      {activeTab === 'overview' ? (
        <div className="px-4 sm:px-5">{overview}</div>
      ) : (
        transactions
      )}
    </>
  )
}
