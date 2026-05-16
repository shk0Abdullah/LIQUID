import { Skeleton } from '@/components/ui/skeleton'

function NodeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* Hash */}
      <div className="border-b border-border px-4 py-2.5">
        <Skeleton className="h-2.5 w-16 mb-1.5" />
        <Skeleton className="h-3 w-40" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NodesLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="mt-1.5 h-3.5 w-40" />
      </div>

      {/* Node card grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <NodeCardSkeleton key={i} />
        ))}
      </div>

      {/* Summary table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 border-b border-border/50 px-4 py-3">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="h-3.5 w-10" />
            <Skeleton className="ml-auto h-3.5 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
