import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  message: string
  subtext?: string
  className?: string
}

export function EmptyState({ icon, message, subtext, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-3 text-3xl text-muted-foreground/40">{icon}</div>
      )}
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {subtext && <p className="mt-1 text-xs text-muted-foreground/60">{subtext}</p>}
    </div>
  )
}
