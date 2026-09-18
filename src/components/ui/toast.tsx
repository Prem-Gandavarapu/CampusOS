import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

type ToastVariant = 'success' | 'error' | 'info'
type ToastInput = { title: string; description?: string; variant?: ToastVariant }
type ToastItem = ToastInput & { id: number }
type ToastContextValue = { toast: (input: ToastInput) => void }

const ToastContext = createContext<ToastContextValue | null>(null)
const icons = { success: CheckCircle2, error: CircleAlert, info: Info }
const colors = { success: 'text-success', error: 'text-destructive', info: 'text-brand' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])
  const toast = useCallback((input: ToastInput) => {
    const id = Date.now()
    setToasts((current) => [...current.slice(-2), { ...input, id }])
    window.setTimeout(() => dismiss(id), 4400)
  }, [dismiss])
  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-6 sm:bottom-6">
          <AnimatePresence initial={false}>
            {toasts.map((item) => {
              const Icon = icons[item.variant ?? 'info']
              return (
                <motion.div key={item.id} animate={{ opacity: 1, y: 0, scale: 1 }} className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border border-border bg-surface p-4 shadow-float" exit={{ opacity: 0, y: 12, scale: 0.98 }} initial={{ opacity: 0, y: 12, scale: 0.98 }} role="status">
                  <Icon aria-hidden="true" className={cn('mt-0.5 size-5 shrink-0', colors[item.variant ?? 'info'])} />
                  <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{item.title}</p>{item.description ? <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{item.description}</p> : null}</div>
                  <button aria-label="Dismiss notification" className="-mr-1 -mt-1 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => dismiss(item.id)} type="button"><X className="size-4" /></button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
