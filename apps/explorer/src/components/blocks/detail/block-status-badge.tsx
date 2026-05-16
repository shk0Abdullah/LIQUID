import { CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type BlockStatus = 'confirmed' | 'pending'

const STATUS_CONFIG: Record<
  BlockStatus,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  confirmed: {
    icon: CheckCircle2,
    label: 'Confirmed',
    className: 'border-green-500/30 bg-green-500/10 text-green-400',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
}

interface BlockStatusBadgeProps {
  status?: BlockStatus
  className?: string
}

export function BlockStatusBadge({ status = 'confirmed', className }: BlockStatusBadgeProps) {
  const { icon: Icon, label, className: colorClass } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        colorClass,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  )
}
