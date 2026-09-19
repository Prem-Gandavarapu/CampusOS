import { ArrowRight, GraduationCap, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { AppLogo } from '../components/shared/app-logo'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true })
  }, [isLoading, navigate, user])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const signedInUser = await login(email, password)
      navigate(signedInUser.role === 'admin' ? '/admin' : '/student', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="page-glow noise-overlay relative grid min-h-screen place-items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-1/4 size-72 rounded-full bg-brand/[.08] blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-1/4 size-80 rounded-full bg-brand-secondary/[.08] blur-3xl" />
    <section className="liquid-glass relative w-full max-w-[520px] rounded-[2rem] border border-white/70 px-6 py-7 shadow-float sm:px-10 sm:py-10">
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <AppLogo />
          <span className="hidden items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success sm:inline-flex"><span className="size-1.5 rounded-full bg-success" />Secure access</span>
        </div>
        <div className="mt-12 max-w-md">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-brand">GIST · CampusOS</p>
          <Badge variant="ai"><Sparkles className="size-3.5" />Campus intelligence, composed</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.07em] text-foreground sm:text-5xl">Enter your campus workspace.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">Sign in with your CampusOS account to continue to your personalized campus workspace.</p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <Input autoComplete="email" label="Email address" onChange={(event) => setEmail(event.target.value)} placeholder="you@campus.edu" required startIcon={Mail} type="email" value={email} />
          <Input autoComplete="current-password" label="Password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required startIcon={LockKeyhole} type="password" value={password} />
          {error ? <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <Button className="group w-full justify-between" disabled={submitting} loading={submitting} size="lg" type="submit"><span className="flex items-center gap-2"><GraduationCap className="size-4" />{submitting ? 'Signing in...' : 'Sign in to CampusOS'}</span><ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></Button>
        </form>
        <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">One secure sign-in for every CampusOS workspace.</p>
          <Link className="inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to="/">Back home</Link>
        </div>
      </div>
    </section>
  </main>
}