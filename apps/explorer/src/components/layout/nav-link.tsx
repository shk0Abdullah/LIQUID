'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface NavLinkProps {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'rounded px-3 py-1.5 text-xs font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}
