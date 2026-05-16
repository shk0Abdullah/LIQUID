'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { NAV_ITEMS } from './nav-items'

export function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Close on route change
  useEffect(() => {
    setOpen(false)
    setExpanded(null)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Hamburger toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="flex h-8 w-8 flex-none items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Side drawer */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex h-[60px] items-center justify-between border-b border-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="6" fill="hsl(207 89% 54%)" />
              <path d="M14 5L20.5 10.5L14 23L7.5 10.5L14 5Z" fill="white" fillOpacity="0.9" />
              <path d="M7.5 10.5L14 13.5L20.5 10.5" stroke="white" strokeOpacity="0.4" strokeWidth="0.75" />
            </svg>
            <span className="text-[14px] font-semibold tracking-tight text-foreground">
              Liquid
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inline search */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex h-9 items-center overflow-hidden rounded-md border border-border bg-background">
            <input
              type="text"
              placeholder="Search…"
              className="flex-1 bg-transparent px-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              aria-label="Search"
            />
            <button
              type="button"
              aria-label="Search"
              className="flex h-full items-center justify-center bg-primary px-3 text-white"
            >
              <Search className="h-[13px] w-[13px]" />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="overflow-y-auto py-2" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            if (!item.sections) {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href!)
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={cn(
                    'flex items-center px-4 py-2.5 text-[13px] transition-colors hover:bg-accent hover:text-foreground',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            }

            const isExpanded = expanded === item.label
            const sectionActive =
              item.sections?.some((s) =>
                s.items.some((i) =>
                  i.href === '/' ? pathname === '/' : pathname.startsWith(i.href),
                ),
              ) ?? false

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : item.label)}
                  aria-expanded={isExpanded}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-accent hover:text-foreground',
                    sectionActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-150',
                      isExpanded ? 'rotate-180' : '',
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isExpanded && (
                  <div className="bg-background/40">
                    {item.sections.map((section, si) => (
                      <div key={si}>
                        {section.title && (
                          <div className="px-6 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            {section.title}
                          </div>
                        )}
                        {section.items.map((subItem) => {
                          const subActive =
                            subItem.href === '/'
                              ? pathname === '/'
                              : pathname.startsWith(subItem.href)
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                'flex items-center py-2 pl-8 pr-4 text-[12.5px] transition-colors hover:bg-accent hover:text-foreground',
                                subActive ? 'text-primary' : 'text-muted-foreground',
                              )}
                            >
                              {subItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
