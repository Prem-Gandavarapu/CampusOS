import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppProviders } from './app/providers'
import { AppShell } from './components/layout/app-shell'
import { LandingPage } from './pages/landing-page'
import { LoginPage } from './pages/login-page'
import { AdminDashboard } from './pages/admin/admin-dashboard'
import { StudentDashboard } from './pages/student/student-dashboard'
import { ComplaintsPage } from './pages/student/complaints-page'
import { AIPage } from './pages/student/ai-page'
import { CareerPage } from './pages/student/career-page'
import { CoursesPage } from './pages/student/courses-page'
import { CourseDetailPage } from './pages/student/course-detail-page'
import { OpportunitiesPage } from './pages/student/opportunities-page'
import { useAuth, type AuthRole } from './lib/auth'

function StudentLayout({ children }: { children: React.ReactNode }) { return <AppShell kind="student">{children}</AppShell> }
function AdminLayout({ children }: { children: React.ReactNode }) { return <AppShell kind="admin">{children}</AppShell> }

function Protected({ children, role }: { children: ReactNode; role?: AuthRole }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your workspace...</div>
  if (!user) return <Navigate replace to="/login" />
  if (role && user.role !== role) return <Navigate replace to={user.role === 'admin' ? '/admin' : '/student'} />
  return <>{children}</>
}

export default function App() {
  return <AppProviders><BrowserRouter><Routes><Route element={<LandingPage />} path="/" /><Route element={<LoginPage />} path="/login" /><Route element={<Protected><StudentLayout><StudentDashboard /></StudentLayout></Protected>} path="/student" /><Route element={<Protected><StudentLayout><CoursesPage /></StudentLayout></Protected>} path="/student/courses" /><Route element={<Protected><StudentLayout><CoursesPage /></StudentLayout></Protected>} path="/student/learning" /><Route element={<Protected><StudentLayout><CourseDetailPage /></StudentLayout></Protected>} path="/student/courses/:courseId" /><Route element={<Protected><StudentLayout><OpportunitiesPage /></StudentLayout></Protected>} path="/student/opportunities" /><Route element={<Protected><StudentLayout><ComplaintsPage /></StudentLayout></Protected>} path="/student/complaints" /><Route element={<Protected><StudentLayout><CareerPage /></StudentLayout></Protected>} path="/student/career" /><Route element={<Protected><StudentLayout><AIPage /></StudentLayout></Protected>} path="/student/ai" /><Route element={<Protected role="admin"><AdminLayout><AdminDashboard /></AdminLayout></Protected>} path="/admin" /><Route element={<Navigate replace to="/" />} path="*" /></Routes></BrowserRouter></AppProviders>
}