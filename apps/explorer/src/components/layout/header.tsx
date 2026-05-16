'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { NavLink } from './nav-link'

const NAV_LINKS = [
  { href: '/', label: 'Overview' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/nodes', label: 'Nodes' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[52px] max-w-container items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-white">
            L
          </div>
          <span className="text-sm font-semibold text-foreground">Liquid Explorer</span>
        </Link>

        {/* Divider */}
        <div className="h-4 w-px bg-border" />

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {/* Search */}
        <div className="ml-auto flex max-w-sm flex-1 items-center">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by block / Txn hash / Address…"
              readOnly
              className="h-8 w-full cursor-default rounded-md border border-border bg-background pl-8 pr-3 text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Version */}
        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-2xs text-muted-foreground">
          v0.1.0
        </span>
      </div>
    </header>
  )
}
