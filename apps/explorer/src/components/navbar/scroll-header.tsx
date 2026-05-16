'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-border'
          : 'bg-white border-b border-transparent',
      )}
    >
      {children}
    </header>
  )
}
