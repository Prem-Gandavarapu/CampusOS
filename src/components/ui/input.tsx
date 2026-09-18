import { AlertCircle, type LucideIcon } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string
  hint?: string
  error?: string
  inputSize?: 'sm' | 'md'
  startIcon?: LucideIcon
  endAdornment?: ReactNode
}

export function Input({
  className,
  id,
  label,
  hint,
  error,
  inputSize = 'md',
  startIcon: StartIcon,
  endAdornment,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = error || hint ? `${inputId}-description` : undefined

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label className="text-sm font-medium text-foreground" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        {StartIcon ? (
          <StartIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        ) : null}
        <input
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full rounded-xl border bg-surface px-3 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-border-strong focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
            inputSize === 'sm' ? 'h-9' : 'h-11',
            StartIcon && 'pl-9',
            Boolean(endAdornment) && 'pr-10',
            error ? 'border-destructive/80 focus:border-destructive focus:ring-destructive/15' : 'border-input',
            className,
          )}
          id={inputId}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground">
            {endAdornment}
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive" id={descriptionId}>
          <AlertCircle aria-hidden="true" className="size-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground" id={descriptionId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
