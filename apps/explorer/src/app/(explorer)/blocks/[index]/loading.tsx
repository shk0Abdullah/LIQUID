import { Skeleton } from '@/components/ui/skeleton'

export default function BlockDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-container px-4 py-6 lg:px-6">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-2.5" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-2.5" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Title row with nav arrows */}
      <div className="mb-5 flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>

      {/* Details card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-border px-4 sm:px-5">
          <Skeleton className="my-[14px] mr-6 h-4 w-16" />
          <Skeleton className="my-[14px] h-4 w-24" />
        </div>

        {/* Detail rows skeleton */}
        <div className="px-4 sm:px-5">
          {/* Group 1: Identity */}
          {[160, 220, 280].map((valueW, i) => (
            <div
              key={i}
              className="flex flex-col gap-y-1.5 border-b border-border py-3.5 sm:flex-row sm:gap-y-0"
            >
              <Skeleton className="h-4 w-[120px] shrink-0" />
              <Skeleton className={`h-4 w-[${valueW}px]`} />
            </div>
          ))}

          {/* Separator */}
          <div className="pb-2 pt-2" />

          {/* Group 2: Transactions */}
          <div className="flex flex-col gap-y-1.5 border-b border-border py-3.5 sm:flex-row sm:gap-y-0">
            <Skeleton className="h-4 w-[120px] shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Separator */}
          <div className="pb-2 pt-2" />

          {/* Group 3: Hashes */}
          {[2].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-y-1.5 border-b border-border py-3.5 sm:flex-row sm:gap-y-0"
            >
              <Skeleton className="h-4 w-[120px] shrink-0" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          ))}
          <div className="flex flex-col gap-y-1.5 border-b border-border py-3.5 sm:flex-row sm:gap-y-0">
            <Skeleton className="h-4 w-[120px] shrink-0" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>

          {/* Separator */}
          <div className="pb-2 pt-2" />

          {/* Group 4: Nonce */}
          <div className="flex flex-col gap-y-1.5 py-3.5 sm:flex-row sm:gap-y-0">
            <Skeleton className="h-4 w-[120px] shrink-0" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
