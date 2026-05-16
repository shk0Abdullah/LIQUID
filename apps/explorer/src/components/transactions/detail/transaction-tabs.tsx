'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface Tab {
  id: string
  label: string
  count?: number
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'raw', label: 'Raw Data' },
]

interface TransactionTabsProps {
  overview: ReactNode
  rawData: ReactNode
}

export function TransactionTabs({ overview, rawData }: TransactionTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('overview')

  return (
    <>
      {/* Tab bar — sits at the top of the card, separated by card's border-b */}
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
                      // Active indicator: thin blue line pinned to bottom of the tab bar
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

      {/* Tab content */}
      <div className="px-4 sm:px-5">
        {activeTab === 'overview' ? overview : rawData}
      </div>
    </>
  )
}
