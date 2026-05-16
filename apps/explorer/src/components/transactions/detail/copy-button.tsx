'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CopyButtonProps {
  value: string
  className?: string
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }, [value])

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={cn(
        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded',
        'text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span className="sr-only">{copied ? 'Copied' : 'Copy to clipboard'}</span>
    </button>
  )
}
