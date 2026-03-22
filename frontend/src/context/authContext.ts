import { createContext } from 'react'

import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth'

export interface AuthContextValue {
  isAuthenticated: boolean
  token: string | null
  user: AuthUser | null
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => void
  register: (payload: RegisterPayload) => Promise<AuthUser>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
