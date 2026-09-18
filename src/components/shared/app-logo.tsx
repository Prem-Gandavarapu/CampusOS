import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function AppLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link aria-label="CampusOS home" className={cn('group inline-flex items-center gap-2.5', className)} to="/">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-secondary text-white shadow-sm shadow-brand/30 transition-transform duration-200 group-hover:scale-105"><GraduationCap aria-hidden="true" className="size-5" /></span>
      {!compact ? <span className="font-display text-[15px] font-semibold tracking-[-0.04em] text-foreground">CampusOS</span> : null}
    </Link>
  )
}
