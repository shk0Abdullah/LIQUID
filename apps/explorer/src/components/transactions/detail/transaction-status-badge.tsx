import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type TxStatus = 'success' | 'failed' | 'pending'

interface TransactionStatusBadgeProps {
  status: TxStatus
  className?: string
}

const STATUS_CONFIG: Record<
  TxStatus,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  success: {
    icon: CheckCircle2,
    label: 'Success',
    className: 'border-green-500/30 bg-green-500/10 text-green-400',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
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
