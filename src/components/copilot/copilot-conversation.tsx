import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Bot, ExternalLink, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { retrieveCampusKnowledge, type KnowledgeDocument } from '../../data/knowledge-base'
import { getCopilotResponse, suggestedPrompts } from '../../data/mock-data'
import { cn } from '../../lib/utils'

type Message = { id: number; role: 'assistant' | 'user'; content: string; sources?: KnowledgeDocument[] }
const welcomeMessage: Message = { id: 1, role: 'assistant', content: 'Hi Priya — ask me about GIST exams, campus information, courses, opportunities, or your next best move.' }
function uniqueSources(sources: KnowledgeDocument[] = []) { return [...new Map(sources.map((source) => [source.sourceUrl, source])).values()].slice(0, 3) }

export function CopilotConversation({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]); const [input, setInput] = useState(''); const [isThinking, setIsThinking] = useState(false); const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isThinking])
  async function ask(question: string) {
    const trimmed = question.trim()
    if (!trimmed || isThinking) return
    const localSources = retrieveCampusKnowledge(trimmed)
    setMessages((current) => [...current, { id: Date.now(), role: 'user', content: trimmed }])
    setInput('')
    setIsThinking(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: messages.slice(-6).map(({ role, content }) => ({ role, content })) }),
      })
      if (!response.ok) throw new Error('Campus RAG unavailable')
      const data = await response.json() as { answer?: string; sources?: KnowledgeDocument[] }
      const sources = uniqueSources(data.sources?.length ? data.sources : localSources)
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: data.answer || fallback(trimmed, sources), sources }])
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: fallback(trimmed, localSources), sources: uniqueSources(localSources) }])
    }
    setIsThinking(false)
  }
  return <div className={cn('flex min-h-0 flex-1 flex-col', className)}><div className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto px-1', compact ? 'max-h-72' : 'max-h-[52vh] pr-2')}>{messages.map((message) => <ChatBubble key={message.id} message={message} />)}<AnimatePresence>{isThinking ? <motion.div animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-muted-foreground" exit={{ opacity: 0 }} initial={{ opacity: 0 }}><span className="grid size-7 place-items-center rounded-lg bg-brand/10 text-brand"><Bot className="size-4" /></span><span className="flex gap-1"><i className="size-1.5 animate-bounce rounded-full bg-brand [animation-delay:-.2s]" /><i className="size-1.5 animate-bounce rounded-full bg-brand [animation-delay:-.1s]" /><i className="size-1.5 animate-bounce rounded-full bg-brand" /></span></motion.div> : null}</AnimatePresence><div ref={bottomRef} /></div>{messages.length === 1 ? <div className="mt-4 flex flex-wrap gap-2">{suggestedPrompts.slice(0, compact ? 3 : 5).map((prompt) => <button className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" key={prompt} onClick={() => void ask(prompt)} type="button">{prompt}</button>)}</div> : null}<form className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-surface p-1.5 shadow-sm focus-within:border-brand/50 focus-within:ring-3 focus-within:ring-brand/10" onSubmit={(event) => { event.preventDefault(); void ask(input) }}><Sparkles className="ml-2 size-4 shrink-0 text-brand" /><input aria-label="Ask Campus AI" className="h-9 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground" onChange={(event) => setInput(event.target.value)} placeholder="Ask about GIST, exams, location, courses…" value={input} /><button aria-label="Send message" className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground transition hover:scale-105 active:scale-95 disabled:opacity-50" disabled={!input.trim() || isThinking} type="submit"><ArrowUp className="size-4" /></button></form>{!compact ? <p className="mt-2 text-center text-[11px] text-muted-foreground">Grounded in local CampusOS context with official GIST sources when relevant.</p> : null}</div>
}
function fallback(question: string, sources: KnowledgeDocument[]) {
  const normalized = question.toLowerCase()
  if (/\b(hi|hello|hey)\b/.test(normalized)) return 'Hi Priya — I can help with GIST programmes, examination results, timetables, campus information, attendance, courses, and opportunities.'
  if (/(attendance|absen|present)/.test(normalized)) return 'Your overall attendance is 86.4%. Machine Learning is at 91%, Distributed Systems is at 84%, and Product Design Studio is at 88%. Attend the next two Distributed Systems sessions to keep a healthy buffer.'
  if (/(result.*portal|portal.*result|gisteb|webpros)/.test(normalized)) return 'The official GIST Examination Section links external results through https://gisteb.com and the CMS marks portal at http://webprosindia.com/gist/. CampusOS cannot retrieve private marks without the official hall-ticket lookup.'
  if (/(address|location|map|where)/.test(normalized)) return 'GIST campus: 3rd Mile, Nellore-Bombay Highway, Gangavaram (V), Kovur (M), S.P.S.R Nellore District, Andhra Pradesh 524137.'
  if (/(contact|email|phone|call)/.test(normalized)) return 'Official contact: principal@gist.edu.in · 9912566220 / 9912445846.'
  if (/(result|exam|timetable|notification|circular|recount|valuation)/.test(normalized) && sources.length) return `Latest verified GIST examination update: ${sources[0].content}`
  if (/(programme|program|branch|course|department)/.test(normalized)) return 'GIST offers B.Tech programmes in CSE, CSE (AI & ML), AI & Data Science, ECE, EEE, Mechanical, and Civil, plus M.Tech and Diploma programmes.'
  if (/(autonomous|accredit|aicte|jntua)/.test(normalized)) return 'GIST is autonomous, approved by AICTE, affiliated with JNTUA, NAAC A Grade accredited, and NBA accredited for ECE, EEE, and Mechanical.'
  if (/(placement|career|job)/.test(normalized)) return 'CampusOS can surface GIST placement and career information from official sources. Ask about a specific programme or opportunity for a focused answer.'
  if (sources.length) return `Verified GIST source: ${sources[0].content}`
  return getCopilotResponse(question)
}
function ChatBubble({ message }: { message: Message }) { const user = message.role === 'user'; const sources = uniqueSources(message.sources); return <div className={cn('flex gap-2.5', user && 'flex-row-reverse')}><span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg', user ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-br from-brand to-brand-secondary text-white')}>{user ? <UserRound className="size-4" /> : <Bot className="size-4" />}</span><div className={cn('max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6', user ? 'rounded-tr-sm bg-brand text-brand-foreground' : 'rounded-tl-sm bg-muted/75 text-foreground')}><p>{message.content}</p>{sources.length ? <div className="mt-3 border-t border-border/70 pt-2.5"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Verified sources</p><span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">{sources.length}</span></div><div className="flex flex-wrap gap-1.5">{sources.map((source) => <a className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-lg border border-border/70 bg-surface/70 px-2 py-1 text-xs font-semibold text-brand transition hover:border-brand/30 hover:bg-brand/5" href={source.sourceUrl} key={source.sourceUrl} rel="noreferrer" target="_blank"><span className="truncate">{source.sourceLabel}</span><ExternalLink className="size-3 shrink-0" /></a>)}</div></div> : null}</div></div> }
