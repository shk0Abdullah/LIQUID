import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive/20 text-red-400 border-destructive/30',
        success: 'border-transparent bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'border-transparent bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        address_from: 'border-red-500/20 bg-red-500/10 text-red-400 font-mono',
        address_to: 'border-green-500/20 bg-green-500/10 text-green-400 font-mono',
        block_ref: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-mono',
        hash: 'border-border bg-muted/50 text-muted-foreground font-mono',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
