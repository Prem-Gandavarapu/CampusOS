import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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

function StudentLayout({ children }: { children: React.ReactNode }) { return <AppShell kind="student">{children}</AppShell> }
function AdminLayout({ children }: { children: React.ReactNode }) { return <AppShell kind="admin">{children}</AppShell> }

export default function App() {
  return <AppProviders><BrowserRouter><Routes><Route element={<LandingPage />} path="/" /><Route element={<LoginPage />} path="/login" /><Route element={<StudentLayout><StudentDashboard /></StudentLayout>} path="/student" /><Route element={<StudentLayout><CoursesPage /></StudentLayout>} path="/student/courses" /><Route element={<StudentLayout><CoursesPage /></StudentLayout>} path="/student/learning" /><Route element={<StudentLayout><CourseDetailPage /></StudentLayout>} path="/student/courses/:courseId" /><Route element={<StudentLayout><OpportunitiesPage /></StudentLayout>} path="/student/opportunities" /><Route element={<StudentLayout><ComplaintsPage /></StudentLayout>} path="/student/complaints" /><Route element={<StudentLayout><CareerPage /></StudentLayout>} path="/student/career" /><Route element={<StudentLayout><AIPage /></StudentLayout>} path="/student/ai" /><Route element={<AdminLayout><AdminDashboard /></AdminLayout>} path="/admin" /><Route element={<Navigate replace to="/" />} path="*" /></Routes></BrowserRouter></AppProviders>
}
