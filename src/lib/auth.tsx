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
async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) as T } catch { return null }
}

async function loadCurrentUser() {
  const response = await fetch('/api/auth/me')
  if (!response.ok) return null
  const data = await readJson<{ user?: AuthUser }>(response)
  return data?.user ?? null
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
      const data = await readJson<{ user?: AuthUser; error?: string }>(response)
      if (!response.ok || !data?.user) throw new Error(data?.error || ('Sign-in failed (' + response.status + '). The authentication service did not return JSON.'))
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
