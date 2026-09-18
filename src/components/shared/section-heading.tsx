import type { ReactNode } from 'react'

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div>{eyebrow ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p> : null}<h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground sm:text-xl">{title}</h2>{detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}</div>{action}</div>
}
