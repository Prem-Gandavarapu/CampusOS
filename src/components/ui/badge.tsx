import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'ai' | 'info' | 'status'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-brand/10 text-brand dark:bg-brand/15',
  success: 'bg-success/10 text-success dark:bg-success/15',
  warning: 'bg-warning/10 text-warning dark:bg-warning/15',
  destructive: 'bg-destructive/10 text-destructive dark:bg-destructive/15',
  outline: 'border border-border bg-transparent text-muted-foreground',
  ai: 'bg-brand/12 text-brand ring-1 ring-brand/15',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  status: 'bg-success/10 text-success ring-1 ring-success/15',
}

export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span
      className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold tracking-[0.01em]', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
