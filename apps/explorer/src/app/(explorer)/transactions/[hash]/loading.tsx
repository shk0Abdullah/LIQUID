import { Skeleton } from '@/components/ui/skeleton'

function SkeletonRow({ valueWidth = 'w-48' }: { valueWidth?: string }) {
  return (
    <div className="flex flex-col gap-y-1.5 border-b border-border py-3.5 sm:flex-row sm:gap-y-0">
      <div className="sm:w-[190px] sm:min-w-[190px]">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex-1">
        <Skeleton className={`h-4 ${valueWidth}`} />
      </div>
    </div>
  )
}

export default function TransactionDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-1.5">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Title skeleton */}
      <div className="mb-5">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Card skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Tab bar skeleton */}
        <div className="flex items-center gap-1 border-b border-border px-5">
          <div className="flex h-12 items-center px-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex h-12 items-center px-4">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Rows skeleton */}
        <div className="px-5">
          <SkeletonRow valueWidth="w-full" />
          <SkeletonRow valueWidth="w-24" />
          <SkeletonRow valueWidth="w-20" />
          <SkeletonRow valueWidth="w-64" />

          {/* Group separator */}
          <div className="border-b border-border pb-2 pt-2" />

          <SkeletonRow valueWidth="w-56" />
          <SkeletonRow valueWidth="w-56" />

          {/* Group separator */}
          <div className="border-b border-border pb-2 pt-2" />

          <SkeletonRow valueWidth="w-24" />

          {/* Group separator */}
          <div className="border-b border-border pb-2 pt-2" />

          <SkeletonRow valueWidth="w-80" />

          {/* Group separator */}
          <div className="border-b border-border pb-2 pt-2" />

          {/* Signature skeleton */}
          <div className="py-3.5">
            <div className="sm:ml-[190px]">
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
