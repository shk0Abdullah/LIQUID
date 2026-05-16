import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  label: string
  value: string | number
  meta?: string
  icon: React.ReactNode
  accent: 'blue' | 'green' | 'purple' | 'cyan'
}

const accentClasses: Record<StatCardProps['accent'], string> = {
  blue: 'text-blue-400 bg-blue-500/10',
  green: 'text-green-400 bg-green-500/10',
  purple: 'text-purple-400 bg-purple-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
}

export function StatCard({ label, value, meta, icon, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            {meta && <p className="mt-1 text-[10px] text-muted-foreground">{meta}</p>}
          </div>
          <div className={cn('shrink-0 rounded-lg p-2.5 [&_svg]:size-5', accentClasses[accent])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
