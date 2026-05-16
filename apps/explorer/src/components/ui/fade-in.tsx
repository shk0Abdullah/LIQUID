'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: Direction
  className?: string
}

const directionOffset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
  none: {},
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.45,
  direction = 'up',
  className,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
