import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react'
import { Button } from '../ui/button'

type StateProps = { title: string; detail: string; action?: { label: string; onClick: () => void } }

export function LoadingState({ title = 'Loading your workspace', detail = 'Preparing the latest campus context.' }: Partial<StateProps>) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center"><LoaderCircle className="size-6 animate-spin text-brand" /><h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2><p className="mt-1 max-w-xs text-sm text-muted-foreground">{detail}</p></div>
}
export function EmptyState({ title, detail, action }: StateProps) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center"><Inbox className="size-6 text-muted-foreground" /><h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2><p className="mt-1 max-w-xs text-sm text-muted-foreground">{detail}</p>{action ? <Button className="mt-4" onClick={action.onClick} size="sm">{action.label}</Button> : null}</div>
}
export function ErrorState({ title, detail, action }: StateProps) {
  return <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center"><CircleAlert className="size-6 text-destructive" /><h2 className="mt-3 text-sm font-semibold text-foreground">{title}</h2><p className="mt-1 max-w-xs text-sm text-muted-foreground">{detail}</p>{action ? <Button className="mt-4" onClick={action.onClick} size="sm" variant="outline">{action.label}</Button> : null}</div>
}
