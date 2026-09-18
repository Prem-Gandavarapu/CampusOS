import { UserRound } from 'lucide-react'
import { cn, getInitials } from '../../lib/utils'

type AvatarProps = {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  status?: 'online' | 'away' | 'offline'
  className?: string
}

const sizes = { sm: 'size-8 text-[10px]', md: 'size-10 text-xs', lg: 'size-12 text-sm' }
const statusStyles = { online: 'bg-success', away: 'bg-warning', offline: 'bg-muted-foreground' }

export function Avatar({ name, src, size = 'md', status, className }: AvatarProps) {
  const label = name ? `${name}'s avatar` : 'User avatar'

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand to-brand-secondary font-semibold text-white ring-2 ring-background',
          sizes[size],
        )}
        role="img"
      >
        {src ? <img alt="" className="size-full object-cover" src={src} /> : name ? getInitials(name) : <UserRound aria-hidden="true" className="size-1/2" />}
      </span>
      {status ? (
        <span
          aria-label={status}
          className={cn('absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background', statusStyles[status])}
          role="status"
        />
      ) : null}
    </span>
  )
}
