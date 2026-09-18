import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BookOpen, Bot, BriefcaseBusiness, Building2, ChartNoAxesCombined, ClipboardPlus, LayoutDashboard, Menu, Megaphone, Search, ShieldAlert, Sparkles, X, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { AppLogo } from '../shared/app-logo'
import { ThemeToggle } from '../shared/theme-toggle'
import { Avatar } from '../ui/avatar'
import { useToast } from '../ui/toast'

type ShellKind = 'student' | 'admin'
type NavItem = { label: string; to: string; icon: LucideIcon; end?: boolean }

const studentItems: NavItem[] = [
  { label: 'Overview', to: '/student', icon: LayoutDashboard, end: true }, { label: 'Courses', to: '/student/courses', icon: BookOpen }, { label: 'Learning', to: '/student/learning', icon: Sparkles }, { label: 'Opportunities', to: '/student/opportunities', icon: BriefcaseBusiness }, { label: 'Complaints', to: '/student/complaints', icon: ClipboardPlus }, { label: 'Career', to: '/student/career', icon: ChartNoAxesCombined }, { label: 'AI Copilot', to: '/student/ai', icon: Bot },
]
const adminItems: NavItem[] = [
  { label: 'Command Center', to: '/admin', icon: LayoutDashboard, end: true }, { label: 'Complaints', to: '/admin#complaints', icon: ShieldAlert }, { label: 'Announcements', to: '/admin#announcements', icon: Megaphone }, { label: 'Courses', to: '/admin#engagement', icon: BookOpen }, { label: 'Events', to: '/admin#campus', icon: Building2 }, { label: 'Analytics', to: '/admin#analytics', icon: ChartNoAxesCombined },
]

export function AppShell({ kind, children }: { kind: ShellKind; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const title = kind === 'student' ? 'Student workspace' : 'Admin command center'
  return <div className="min-h-screen bg-background"><a className="skip-link" href="#main-content">Skip to main content</a><Sidebar kind={kind} onClose={() => setMobileOpen(false)} open={mobileOpen} /><div className="min-h-screen lg:pl-[17.5rem]"><TopBar onMenu={() => setMobileOpen(true)} title={title} /><main className="page-glow page-grid min-h-[calc(100vh-4.5rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8" id="main-content">{children}</main></div></div>
}

function Sidebar({ kind, open, onClose }: { kind: ShellKind; open: boolean; onClose: () => void }) {
  const items = kind === 'student' ? studentItems : adminItems
  const role = kind === 'student' ? 'Student' : 'Administration'
  const content = <><div className="flex items-center justify-between px-4 py-5"><AppLogo /><button aria-label="Close navigation" className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden" onClick={onClose} type="button"><X className="size-5" /></button></div><div className="mx-3 h-px bg-border" /><nav aria-label={`${role} navigation`} className="flex-1 space-y-1 px-3 py-5">{items.map((item) => <NavLink className={({ isActive }) => cn('group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,transform] duration-200', isActive ? 'bg-brand/10 text-brand before:absolute before:left-0 before:h-5 before:w-0.5 before:rounded-full before:bg-brand' : 'text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground')} end={item.end} key={item.label} onClick={onClose} to={item.to}><item.icon aria-hidden="true" className="size-[18px] transition-transform duration-200 group-hover:scale-110" />{item.label}</NavLink>)}</nav><div className="m-3 rounded-2xl border border-border bg-surface-raised/80 p-3.5"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-secondary text-xs font-bold text-white shadow-sm shadow-brand/20">{kind === 'student' ? 'PS' : 'AD'}</span><div><p className="text-xs font-semibold text-foreground">{role}</p><p className="text-[11px] text-muted-foreground">CampusOS workspace</p></div></div></div></>
  return <><aside className="glass-panel fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] flex-col border-r border-border lg:flex">{content}</aside><AnimatePresence>{open ? <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-foreground/35 backdrop-blur-[2px] lg:hidden" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={onClose}><motion.aside animate={{ x: 0 }} className="glass-panel flex h-full w-[17.5rem] flex-col border-r border-border shadow-float" exit={{ x: -300 }} initial={{ x: -300 }} onMouseDown={(event) => event.stopPropagation()} transition={{ duration: 0.22, ease: 'easeOut' }}>{content}</motion.aside></motion.div> : null}</AnimatePresence></>
}

function TopBar({ title, onMenu }: { title: string; onMenu: () => void }) {
  const { toast } = useToast()
  return <header className="glass-panel sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-border/80 px-4 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden" onClick={onMenu} type="button"><Menu className="size-5" /></button><div><p className="hidden text-xs font-medium text-muted-foreground sm:block">CampusOS</p><h1 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">{title}</h1></div></div><div className="flex items-center gap-1 sm:gap-2"><Link aria-label="Ask CampusOS" className="hidden h-9 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 text-xs font-semibold text-muted-foreground transition-[border-color,background-color,color] hover:border-border-strong hover:bg-surface hover:text-foreground sm:flex" to="/student/ai"><Search className="size-3.5" />Ask CampusOS <kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd></Link><ThemeToggle /><button aria-label="View notifications" className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" onClick={() => toast({ title: 'You’re up to date', description: 'No new priority notifications.' })} type="button"><Bell className="size-[18px]" /></button><Link aria-label="Student profile" className="ml-1 rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/student"><Avatar name="Priya Sharma" size="sm" status="online" /></Link></div></header>
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('mx-auto w-full max-w-[1440px]', className)}>{children}</div> }
