'use client'

import { LayoutDashboard, Blocks, ArrowLeftRight, Network } from 'lucide-react'
import { NavLink } from './nav-link'

const NAV = [
  { href: '/', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/blocks', label: 'Blocks', icon: <Blocks /> },
  { href: '/transactions', label: 'Transactions', icon: <ArrowLeftRight /> },
  { href: '/nodes', label: 'Nodes', icon: <Network /> },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[200px] flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
          L
        </div>
        <span className="text-sm font-semibold tracking-tight sidebar-label">Liquid</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Status footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="sidebar-label text-[10px] text-muted-foreground">Connected</span>
        </div>
      </div>
    </aside>
  )
}
