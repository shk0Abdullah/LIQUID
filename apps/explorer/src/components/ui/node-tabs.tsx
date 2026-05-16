'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { NodeInfo } from '@/types'

interface NodeTabsProps {
  nodes: NodeInfo[]
  activeNodeId: string
  basePath: string
}

export function NodeTabs({ nodes, activeNodeId, basePath }: NodeTabsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {nodes.map((node) => {
        const isActive = node.id === activeNodeId
        return (
          <Link
            key={node.id}
            href={`${basePath}?nodeId=${encodeURIComponent(node.id)}`}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
              isActive
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground',
            )}
          >
            {/* Status dot */}
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                  isActive ? 'bg-primary' : 'bg-emerald-400',
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-1.5 w-1.5 rounded-full',
                  isActive ? 'bg-primary' : 'bg-emerald-500',
                )}
              />
            </span>

            <span>{node.id}</span>

            <span
              className={cn(
                'font-mono text-2xs',
                isActive ? 'text-primary/70' : 'text-muted-foreground/60',
              )}
            >
              #{node.height}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
