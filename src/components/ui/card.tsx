import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  interactive?: boolean
  tone?: 'default' | 'subtle' | 'glass'
}

const tones = {
  default: 'border-border/90 bg-surface shadow-card',
  subtle: 'border-border/70 bg-surface/65 shadow-none',
  glass: 'border-white/15 bg-surface/80 shadow-card backdrop-blur-xl dark:border-white/10',
}

export function Card({ className, children, interactive = false, tone = 'default', ...props }: CardProps) {
  return (
    <section
      className={cn(
        'surface-reflection relative rounded-[1.125rem] border p-5 transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out sm:p-6',
        tones[tone],
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:scale-[1.005] hover:border-border-strong hover:shadow-card-hover active:scale-[.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn('text-base font-semibold tracking-tight text-foreground', className)}>{children}</h2>
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('mt-1 text-sm leading-6 text-muted-foreground', className)}>{children}</p>
}
