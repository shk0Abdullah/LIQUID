'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface AnimatedNumberProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1100,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    let startTime: number | null = null
    const start = 0
    const end = value

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * end))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{current.toLocaleString()}{suffix}
    </span>
  )
}
