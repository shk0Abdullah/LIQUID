'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface InputDataDisplayProps {
  data: string | undefined
}

export function InputDataDisplay({ data }: InputDataDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [data])

  if (!data) {
    return (
      <span className="font-mono text-sm text-muted-foreground">—</span>
    )
  }

  return (
    <div className="w-full">
      <div className="relative rounded-md border border-border bg-muted/20">
        <pre className="max-h-40 overflow-y-auto overflow-x-auto p-3 pr-10 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
          {data}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy signature'}
          className={cn(
            'absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded',
            'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          )}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="sr-only">{copied ? 'Copied' : 'Copy signature'}</span>
        </button>
      </div>
    </div>
  )
}
