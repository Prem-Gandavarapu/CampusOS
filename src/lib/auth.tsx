import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type AuthRole = 'admin' | 'student'
export type AuthUser = { id: string; email: string; fullName: string; role: AuthRole }

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const authKey = ['auth', 'me']

async function loadCurrentUser() {
  const response = await fetch('/api/auth/me')
  if (!response.ok) return null
  const data = await response.json() as { user: AuthUser }
  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: authKey, queryFn: loadCurrentUser, retry: false, staleTime: 60_000 })

  const value = useMemo<AuthContextValue>(() => ({
    user: query.data ?? null,
    isLoading: query.isLoading,
    async login(email, password) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json() as { user?: AuthUser; error?: string }
      if (!response.ok || !data.user) throw new Error(data.error || 'Unable to sign in.')
      queryClient.setQueryData(authKey, data.user)
      return data.user
    },
    async logout() {
      await fetch('/api/auth/logout', { method: 'POST' })
      queryClient.setQueryData(authKey, null)
    },
  }), [query.data, query.isLoading, queryClient])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
