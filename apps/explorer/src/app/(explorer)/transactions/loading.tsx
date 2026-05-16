import { Skeleton } from '@/components/ui/skeleton'

export default function TransactionsLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-1.5 h-3.5 w-56" />
      </div>

      {/* Node tabs */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      {/* Table panel */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-3.5 w-52" />
        </div>
        <div className="overflow-x-auto">
          {/* Table header */}
          <div className="flex gap-4 border-b border-border bg-muted/20 px-4 py-3">
            {[110, 60, 55, 100, 16, 100, 70].map((w, i) => (
              <Skeleton key={i} className={`h-3 w-[${w}px]`} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border/50 px-4 py-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-4" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="ml-auto h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
