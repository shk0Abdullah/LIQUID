import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DetailRowProps {
  label: string
  children: ReactNode
  noBorder?: boolean
  alignItems?: 'start' | 'center'
  className?: string
}

export function DetailRow({
  label,
  children,
  noBorder = false,
  alignItems = 'start',
  className,
}: DetailRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-y-1.5 py-3.5 sm:flex-row sm:gap-y-0',
        !noBorder && 'border-b border-border',
        className,
      )}
    >
      {/* Label column — fixed 190px on sm+ */}
      <div
        className={cn(
          'flex shrink-0 gap-1.5 sm:w-[190px] sm:min-w-[190px]',
          alignItems === 'center' ? 'items-center' : 'items-start pt-px',
        )}
      >
        <Info
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground/40',
            alignItems === 'start' && 'mt-0.5',
          )}
        />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      {/* Value column */}
      <div
        className={cn(
          'min-w-0 flex-1',
          alignItems === 'center' ? 'flex items-center' : 'flex items-start',
        )}
      >
        {children}
      </div>
    </div>
  )
}
