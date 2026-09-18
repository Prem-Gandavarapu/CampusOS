import { ExternalLink, Sparkles } from 'lucide-react'
import { CopilotConversation } from '../../components/copilot/copilot-conversation'
import { PageContainer } from '../../components/layout/app-shell'
import { PageTransition } from '../../components/shared/page-transition'
import { Badge } from '../../components/ui/badge'
import { Card } from '../../components/ui/card'

export function AIPage() {
  return <PageTransition><PageContainer className="space-y-6"><header><Badge variant="ai"><Sparkles className="size-3" />Grounded campus intelligence</Badge><h1 className="mt-3 text-3xl font-semibold tracking-[-.06em] text-foreground sm:text-4xl">Campus AI</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">Ask anything about your campus. Answers are grounded in verified GIST information when available.</p></header><Card className="min-h-[32rem] p-4 sm:p-6"><CopilotConversation /></Card><div className="grid gap-3 sm:grid-cols-3"><SourceHint title="GIST results" href="https://gist.edu.in/gist/wp-content/uploads/2026/06/B.Tech-Regular-and-Supplementary-April-May-2026-Examinations-Results.pdf" /><SourceHint title="Examination section" href="https://gist.edu.in/gist/examinations/" /><SourceHint title="Notice board" href="https://gist.edu.in/gist/gist-home/" /></div></PageContainer></PageTransition>
}
function SourceHint({ title, href }: { title: string; href: string }) { return <a className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:border-brand/30" href={href} rel="noreferrer" target="_blank">{title}<ExternalLink className="size-4 text-brand" /></a> }
