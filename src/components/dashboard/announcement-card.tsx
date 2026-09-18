import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Badge } from '../ui/badge'

type Announcement = { id: string; title: string; audience: string; priority: string; date: string; summary: string; tone: string }

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const variant = announcement.tone === 'warning' ? 'warning' : announcement.tone === 'success' ? 'success' : 'default'
  return <article className="group rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-card"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant={variant}>{announcement.priority}</Badge><span className="text-xs text-muted-foreground">{announcement.date}</span></div><h3 className="mt-2 text-sm font-semibold tracking-tight text-foreground">{announcement.title}</h3></div><ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><p className="mt-2 text-xs font-medium text-muted-foreground">{announcement.audience}</p><div className="mt-3 flex gap-2 rounded-xl bg-brand/[0.055] p-2.5"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand" /><p className="text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">AI summary: </span>{announcement.summary}</p></div></article>
}
