'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ExplorerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-container min-h-[400px] flex-col items-center justify-center gap-5 px-4 text-center lg:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Something went wrong</p>
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
          {error.message || 'Failed to load data from the node API. Make sure the node is running.'}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  )
}
