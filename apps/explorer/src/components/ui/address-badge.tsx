import { Badge } from './badge'
import { shortHash } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface AddressBadgeProps {
  address: string
  variant?: 'from' | 'to' | 'neutral'
  take?: number
  className?: string
}

export function AddressBadge({ address, variant = 'neutral', take = 8, className }: AddressBadgeProps) {
  const badgeVariant =
    variant === 'from' ? 'address_from' : variant === 'to' ? 'address_to' : 'hash'

  return (
    <Badge variant={badgeVariant} className={cn('text-[10px]', className)}>
      {shortHash(address, take)}
    </Badge>
  )
}
