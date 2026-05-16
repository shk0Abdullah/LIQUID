'use client'

import { Network } from 'lucide-react'
import { NodeCard } from './node-card'
import type { NodeInfo } from '@/types'
import { StaggerList, StaggerItem } from '@/components/ui/stagger-list'

export function NodesGrid({ nodes }: { nodes: NodeInfo[] }) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Network className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No nodes found</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Start the node API to connect</p>
      </div>
    )
  }

  return (
    <StaggerList className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => (
        <StaggerItem key={node.id}>
          <NodeCard node={node} />
        </StaggerItem>
      ))}
    </StaggerList>
  )
}
