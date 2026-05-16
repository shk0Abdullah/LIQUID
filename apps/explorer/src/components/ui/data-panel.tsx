import { cn } from '@/lib/utils/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPanelProps {
  title?: string
  description?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function DataPanel({
  title,
  description,
  headerRight,
  children,
  className,
  noPadding,
}: DataPanelProps) {
  return (
    <Card className={cn('', className)}>
      {(title || headerRight) && (
        <CardHeader className={cn('border-b border-border/60 py-3 px-5')}>
          <div className="flex items-center justify-between gap-4">
            <div>
              {title && <CardTitle className="text-sm">{title}</CardTitle>}
              {description && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
              )}
            </div>
            {headerRight}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? 'p-0' : 'p-5')}>{children}</CardContent>
    </Card>
  )
}
