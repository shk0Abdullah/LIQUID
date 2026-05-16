'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
import { shortHash } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface HashDisplayProps {
  hash: string
  take?: number
  className?: string
}

export function HashDisplay({ hash, take = 10, className }: HashDisplayProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'cursor-default font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors',
              className,
            )}
          >
            {shortHash(hash, take)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="break-all">{hash}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
