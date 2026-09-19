import { LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-foreground shadow-sm shadow-brand/25 hover:-translate-y-0.5 hover:bg-brand/90 hover:shadow-md hover:shadow-brand/25',
  secondary: 'border border-border bg-surface-raised text-foreground shadow-sm hover:-translate-y-0.5 hover:border-border-strong hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  outline:
    'border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-muted/70',
  destructive:
    'bg-destructive text-white shadow-sm shadow-destructive/20 hover:bg-destructive/90 hover:shadow-md',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-5 text-sm',
  icon: 'size-10 rounded-xl p-0',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'button-sheen group inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px active:scale-[0.98]',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: LucideIcon
  children?: ReactNode
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  icon: Icon,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : Icon ? <Icon aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:scale-110" /> : null}
      {children}
    </button>
  )
}
