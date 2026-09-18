import { ArrowUpRight, Bell, CalendarClock, ExternalLink, FileCheck2, FileText, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { campusIntelItems } from '../../data/mock-data'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

const categoryIcon = {
  'Examination Results': FileCheck2,
  'Examination Timetable': CalendarClock,
  'Academic Notification': Bell,
  Circular: FileText,
}

export function CampusIntelligence() {
  return <section className="space-y-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2"><Badge variant="ai"><Sparkles className="size-3" />Campus intelligence</Badge><span className="text-xs text-muted-foreground">Official GIST sources</span></div>
        <h2 className="mt-3 text-xl font-semibold tracking-[-.04em] text-foreground sm:text-2xl">Latest from GIST</h2>
        <p className="mt-1 text-sm text-muted-foreground">Relevant examination updates, notices, and circulars in one calm view.</p>
      </div>
      <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-secondary" href="https://gist.edu.in/gist/gist-home/" rel="noreferrer" target="_blank">Open notice board <ArrowUpRight className="size-4" /></a>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {campusIntelItems.map((item, index) => {
        const Icon = categoryIcon[item.category]
        return <motion.article animate={{ opacity: 1, y: 0 }} className="group flex min-h-[188px] flex-col rounded-2xl border border-border bg-surface p-4 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card-hover" initial={{ opacity: 0, y: 10 }} key={item.id} transition={{ delay: index * .05 }}>
          <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-105"><Icon className="size-[18px]" /></span>{item.isNew ? <Badge variant="status">NEW</Badge> : null}</div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.11em] text-muted-foreground">{item.category}</p>
          <h3 className="mt-1.5 line-clamp-3 text-sm font-semibold leading-5 text-foreground">{item.title}</h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className="text-xs text-muted-foreground">{item.date}</span><a aria-label={`View source for ${item.title}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={item.sourceUrl} rel="noreferrer" target="_blank">View source <ExternalLink className="size-3.5" /></a></div>
        </motion.article>
      })}
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)]">
      <Card className="relative overflow-hidden border-brand/15 bg-gradient-to-br from-brand/[.08] via-surface to-surface p-5 sm:p-6"><div className="absolute -right-10 -top-12 size-36 rounded-full bg-brand/10 blur-3xl" /><div className="relative"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-brand"><span className="ai-indicator grid size-6 place-items-center rounded-lg bg-brand/10"><Sparkles className="size-3.5" /></span>AI summary</div><h3 className="mt-4 text-lg font-semibold tracking-[-.03em] text-foreground">A new examination update is ready for you.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">CampusOS found a new examination update from GIST. Results are available through the official examination portal.</p><div className="mt-5 flex flex-wrap gap-2"><a href={campusIntelItems[0].sourceUrl} rel="noreferrer" target="_blank"><Button size="sm" icon={ExternalLink}>View Results</Button></a><a href="https://gist.edu.in/gist/examinations/" rel="noreferrer" target="_blank"><Button size="sm" variant="secondary">View Circular</Button></a></div></div></Card>
      <Card className="p-5 sm:p-6"><CardHeader className="p-0"><div><CardTitle>Important for you</CardTitle><CardDescription>Personalized from the latest official notice board.</CardDescription></div><span className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning"><Bell className="size-4" /></span></CardHeader><div className="mt-5 rounded-xl border border-warning/15 bg-warning/[.06] p-3.5 text-sm leading-6 text-foreground">New examination results have been published. Check your result through the official GIST examination portal.</div><Link className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-secondary" to="/student/ai">Ask Campus AI <ArrowUpRight className="size-4" /></Link></Card>
    </div>
  </section>
}
