'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.065,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  },
}

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerListProps) {
  return (
    <motion.div variants={itemVariants} className={cn(className)}>
      {children}
    </motion.div>
  )
}
