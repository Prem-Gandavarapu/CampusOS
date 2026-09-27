import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LoaderCircle, Plus, Trash2, Users, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'

type Student = {
  id: string
  fullName: string
  email: string
  rollNumber: string
  department: string
  yearOfStudy: number
}

const emptyForm = { fullName: '', email: '', password: '', rollNumber: '', department: 'Computer Science and Engineering', yearOfStudy: '1' }

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function loadStudents() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/students')
      const data = await response.json() as { students?: Student[]; error?: string }
      if (!response.ok) throw new Error(data.error || 'Unable to load students.')
      setStudents(data.students || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load students.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadStudents() }, [])

  function change(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function addStudent() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, yearOfStudy: Number(form.yearOfStudy) }) })
      const data = await response.json() as { student?: Student; error?: string }
      if (!response.ok) throw new Error(data.error || 'Unable to create student.')
      setForm(emptyForm)
      setMessage('Student account created.')
      await loadStudents()
      setShowForm(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create student.')
    } finally {
      setSaving(false)
    }
  }

  async function removeStudent(student: Student) {
    if (!window.confirm('Remove ' + student.fullName + ' from CampusOS?')) return
    setError('')
    const response = await fetch('/api/admin/students/' + student.id, { method: 'DELETE' })
    const data = await response.json() as { error?: string }
    if (!response.ok) {
      setError(data.error || 'Unable to remove student.')
      return
    }
    setStudents((current) => current.filter((item) => item.id !== student.id))
  }

  return <section className="grid gap-5 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
    <div className="flex items-center justify-between rounded-2xl border border-brand/15 bg-brand/[.045] p-4"><div><p className="text-sm font-semibold text-foreground">Student access</p><p className="mt-1 text-xs text-muted-foreground">Create a secure academic workspace account.</p></div><Button icon={Plus} onClick={() => { setError(''); setMessage(''); setShowForm(true) }}>Add student</Button></div><AnimatePresence>{showForm ? <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/20 p-3 backdrop-blur-[2px] sm:items-center sm:p-6" exit={{ opacity: 0 }} initial={{ opacity: 0 }} onMouseDown={() => !saving && setShowForm(false)}><motion.div animate={{ opacity: 1, y: 0, scale: 1 }} className="liquid-glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-surface/95 p-5 shadow-float sm:p-7" exit={{ opacity: 0, y: 16, scale: .98 }} initial={{ opacity: 0, y: 16, scale: .98 }} onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><Badge variant="ai"><Users className="size-3" />Admin only</Badge><h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">Add student</h2><p className="mt-1 text-sm text-muted-foreground">Create a secure account and academic profile.</p></div><button aria-label="Close add student" className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95" disabled={saving} onClick={() => setShowForm(false)} type="button"><X className="size-4" /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Input label="Full name" onChange={(event) => change('fullName', event.target.value)} value={form.fullName} /><Input label="Roll number" onChange={(event) => change('rollNumber', event.target.value)} value={form.rollNumber} /><Input className="sm:col-span-2" label="Email" onChange={(event) => change('email', event.target.value)} type="email" value={form.email} /><Input className="sm:col-span-2" hint="Minimum 8 characters" label="Temporary password" onChange={(event) => change('password', event.target.value)} type="password" value={form.password} /><Input className="sm:col-span-2" label="Department" onChange={(event) => change('department', event.target.value)} value={form.department} /><Input label="Year of study" max="6" min="1" onChange={(event) => change('yearOfStudy', event.target.value)} type="number" value={form.yearOfStudy} /></div>{error ? <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}<div className="mt-6 flex justify-end gap-2"><Button disabled={saving} onClick={() => setShowForm(false)} type="button" variant="ghost">Cancel</Button><Button disabled={saving} loading={saving} icon={Plus} onClick={() => void addStudent()}>Create student account</Button></div></motion.div></motion.div> : null}</AnimatePresence>
    {message ? <p className="text-sm text-success">{message}</p> : null}`r`n    <Card className="p-5">
      <CardHeader><div><CardTitle>Student directory</CardTitle><CardDescription>Only administrators can add or remove student accounts.</CardDescription></div><Badge variant="outline">{students.length} accounts</Badge></CardHeader>
      {loading ? <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading directory...</div> : students.length ? <div className="space-y-2">{students.map((student) => <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-raised/40 p-3.5 sm:flex-row sm:items-center sm:justify-between" key={student.id}><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{student.fullName}</p><p className="truncate text-xs text-muted-foreground">{student.email} · {student.rollNumber}</p><p className="mt-1 text-[11px] text-muted-foreground">{student.department} · Year {student.yearOfStudy}</p></div><Button aria-label={'Remove ' + student.fullName} onClick={() => void removeStudent(student)} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div>)}</div> : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No student accounts yet.</div>}
    </Card>
  </section>
}




