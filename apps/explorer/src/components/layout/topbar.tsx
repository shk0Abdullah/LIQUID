import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur-sm">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search blocks, transactions…"
          className="pl-8 h-8 bg-muted/40 border-muted focus-visible:bg-muted/60"
          readOnly
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-2 py-0.5">
          v0.1.0
        </span>
      </div>
    </header>
  )
}
