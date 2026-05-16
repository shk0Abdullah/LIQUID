import { cn } from '@/lib/utils/cn'

interface StatusDotProps {
  active?: boolean
  className?: string
}

export function StatusDot({ active = true, className }: StatusDotProps) {
  return (
    <span className={cn('relative flex h-2 w-2 shrink-0', className)}>
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      )}
      <span
        className={cn(
          'relative inline-flex h-2 w-2 rounded-full',
          active ? 'bg-green-500' : 'bg-muted-foreground',
        )}
      />
    </span>
  )
}
