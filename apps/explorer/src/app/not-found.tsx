import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <p className="font-mono text-7xl font-bold tabular-nums text-border">404</p>
      <div className="max-w-xs">
        <p className="text-sm font-semibold text-foreground">Page not found</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Home className="h-3.5 w-3.5" />
        Back to Explorer
      </Link>
    </div>
  )
}
