import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export function ProgressBar({ value, className, tone = 'brand', label }: { value: number; className?: string; tone?: 'brand' | 'success' | 'warning'; label?: string }) {
  const tones = { brand: 'from-brand to-brand-secondary', success: 'from-emerald-500 to-teal-400', warning: 'from-amber-400 to-orange-500' }
  return <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} className={cn('h-2 overflow-hidden rounded-full bg-muted', className)} role="progressbar"><motion.div animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} className={cn('h-full rounded-full bg-gradient-to-r', tones[tone])} initial={{ width: '0%' }} transition={{ duration: 0.72, ease: 'easeOut' }} /></div>
}
