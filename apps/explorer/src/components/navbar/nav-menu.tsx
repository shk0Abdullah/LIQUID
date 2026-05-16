'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { NAV_ITEMS } from './nav-items'
import { NavDropdown } from './nav-dropdown'

function isItemActive(item: (typeof NAV_ITEMS)[number], pathname: string): boolean {
  if (item.href) {
    return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  }
  return (
    item.sections?.some((s) =>
      s.items.some((i) => (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))),
    ) ?? false
  )
}

export function NavMenu() {
  const pathname = usePathname()
  const [openItem, setOpenItem] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback((label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpenItem(label)
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenItem(null), 160)
  }, [])

  return (
    <nav className="hidden items-center lg:flex" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(item, pathname)
        const isOpen = openItem === item.label

        if (!item.sections) {
          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                'flex h-[60px] items-center px-3 text-[13px] transition-colors duration-150',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          )
        }

        return (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => open(item.label)}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              className={cn(
                'flex h-[60px] cursor-default items-center gap-0.5 px-3 text-[13px] transition-colors duration-150',
                active || isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
              <ChevronDown
                className={cn(
                  'ml-0.5 h-3 w-3 transition-transform duration-150',
                  isOpen ? 'rotate-180' : '',
                )}
                aria-hidden="true"
              />
            </button>

            {isOpen && <NavDropdown sections={item.sections} />}
          </div>
        )
      })}
    </nav>
  )
}
