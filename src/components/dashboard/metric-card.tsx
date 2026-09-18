import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '../ui/card'

export function MetricCard({ label, value, detail, icon: Icon, tone = 'brand', index = 0 }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: 'brand' | 'success' | 'warning'; index?: number }) {
  const toneStyles = { brand: 'bg-brand/10 text-brand', success: 'bg-success/10 text-success', warning: 'bg-warning/10 text-warning' }
  return <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} transition={{ delay: index * 0.055, duration: 0.32 }} whileHover={{ y: -3 }}><Card className="h-full overflow-hidden p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><span className={`grid size-10 place-items-center rounded-xl ${toneStyles[tone]}`}><Icon className="size-[18px]" /></span><span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-success"><ArrowUpRight className="size-3.5" />On track</span></div><p className="mt-6 text-[1.7rem] font-semibold tracking-[-0.06em] text-foreground">{value}</p><p className="mt-1 text-sm font-semibold text-foreground">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></Card></motion.div>
}
