import { useEffect, useState } from 'react'
import { LoaderCircle, Plus, Trash2, Users } from 'lucide-react'
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
    <Card className="p-5">
      <CardHeader><div><Badge variant="ai"><Users className="size-3" />Admin only</Badge><CardTitle className="mt-3">Add student</CardTitle><CardDescription>Create a secure account and academic profile.</CardDescription></div></CardHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Full name" onChange={(event) => change('fullName', event.target.value)} value={form.fullName} />
        <Input label="Roll number" onChange={(event) => change('rollNumber', event.target.value)} value={form.rollNumber} />
        <Input className="sm:col-span-2" label="Email" onChange={(event) => change('email', event.target.value)} type="email" value={form.email} />
        <Input className="sm:col-span-2" hint="Minimum 8 characters" label="Temporary password" onChange={(event) => change('password', event.target.value)} type="password" value={form.password} />
        <Input className="sm:col-span-2" label="Department" onChange={(event) => change('department', event.target.value)} value={form.department} />
        <Input label="Year of study" max="6" min="1" onChange={(event) => change('yearOfStudy', event.target.value)} type="number" value={form.yearOfStudy} />
      </div>
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      {error ? <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      <Button className="mt-4 w-full" disabled={saving} loading={saving} icon={Plus} onClick={() => void addStudent()}>Create student account</Button>
    </Card>
    <Card className="p-5">
      <CardHeader><div><CardTitle>Student directory</CardTitle><CardDescription>Only administrators can add or remove student accounts.</CardDescription></div><Badge variant="outline">{students.length} accounts</Badge></CardHeader>
      {loading ? <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading directory...</div> : students.length ? <div className="space-y-2">{students.map((student) => <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface-raised/40 p-3.5 sm:flex-row sm:items-center sm:justify-between" key={student.id}><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{student.fullName}</p><p className="truncate text-xs text-muted-foreground">{student.email} · {student.rollNumber}</p><p className="mt-1 text-[11px] text-muted-foreground">{student.department} · Year {student.yearOfStudy}</p></div><Button aria-label={'Remove ' + student.fullName} onClick={() => void removeStudent(student)} size="icon" variant="ghost"><Trash2 className="size-4 text-destructive" /></Button></div>)}</div> : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No student accounts yet.</div>}
    </Card>
  </section>
}
