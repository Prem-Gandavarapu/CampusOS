import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/layout/app-shell'
import { PageTransition } from '../../components/shared/page-transition'
import { Card } from '../../components/ui/card'

export function StudentSectionPlaceholder({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return <PageTransition><PageContainer><section className="mx-auto max-w-2xl pt-10 text-center sm:pt-20"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand"><Icon className="size-6" /></span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.055em] text-foreground">{title}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">{description}</p><Card className="mt-8 p-6 text-left"><p className="text-sm font-semibold text-foreground">Foundation route ready</p><p className="mt-2 text-sm leading-6 text-muted-foreground">This area is intentionally kept lightweight in the MVP foundation. Navigation, layout, theme, and shared component behavior are in place.</p><Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-secondary" to="/student">Back to dashboard <ArrowRight className="size-4" /></Link></Card></section></PageContainer></PageTransition>
}
