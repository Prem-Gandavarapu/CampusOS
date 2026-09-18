import type { LucideIcon } from 'lucide-react'
import { Bot, LayoutDashboard, PanelTop } from 'lucide-react'

export type Role = 'student' | 'faculty' | 'admin'

export type NavigationItem = {
  href?: string
  icon: LucideIcon
  label: string
  action?: 'command'
}

export type RoleNavigation = {
  label: string
  shortLabel: string
  description: string
  accent: string
  items: NavigationItem[]
}

export const roleNavigation: Record<Role, RoleNavigation> = {
  student: {
    label: 'Student',
    shortLabel: 'ST',
    description: 'A focused space for your campus day.',
    accent: 'from-violet-500 to-indigo-500',
    items: [
      { href: '/student', icon: LayoutDashboard, label: 'Overview' },
      { href: '#foundation', icon: PanelTop, label: 'Foundation' },
      { action: 'command', icon: Bot, label: 'Command menu' },
    ],
  },
  faculty: {
    label: 'Faculty',
    shortLabel: 'FC',
    description: 'A calm foundation for teaching work.',
    accent: 'from-sky-500 to-cyan-500',
    items: [
      { href: '/faculty', icon: LayoutDashboard, label: 'Overview' },
      { href: '#foundation', icon: PanelTop, label: 'Foundation' },
      { action: 'command', icon: Bot, label: 'Command menu' },
    ],
  },
  admin: {
    label: 'Administration',
    shortLabel: 'AD',
    description: 'An intentional operating layer for campus teams.',
    accent: 'from-amber-500 to-orange-500',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
      { href: '#foundation', icon: PanelTop, label: 'Foundation' },
      { action: 'command', icon: Bot, label: 'Command menu' },
    ],
  },
}

export const roleCopy: Record<Role, { title: string; eyebrow: string; summary: string }> = {
  student: {
    eyebrow: 'Student workspace',
    title: 'A calmer way to move through campus.',
    summary: 'Your personalized experience will take shape here in upcoming phases.',
  },
  faculty: {
    eyebrow: 'Faculty workspace',
    title: 'A clearer home for academic work.',
    summary: 'Teaching and collaboration tools will be introduced in upcoming phases.',
  },
  admin: {
    eyebrow: 'Campus administration',
    title: 'One composed operating layer for your institution.',
    summary: 'Administrative intelligence and campus controls will be introduced in upcoming phases.',
  },
}
