import { Skeleton } from '@/components/ui/skeleton'

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
      <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </div>
      {cols > 2 && <Skeleton className="hidden sm:block h-3 w-28" />}
      <Skeleton className="h-5 w-16 shrink-0" />
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Hero skeleton */}
      <div className="mb-6 rounded-lg border border-border/50 bg-card/50 px-8 py-9">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="mt-2 h-4 w-52" />
        <div className="mt-5 flex max-w-xl">
          <Skeleton className="h-10 flex-1 rounded-l-md" />
          <Skeleton className="h-10 w-20 rounded-r-md" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3.5">
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Panels skeleton */}
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((panel) => (
          <div key={panel} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, i) => (
                <RowSkeleton key={i} cols={3} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
