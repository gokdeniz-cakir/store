import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { AuthContext } from './authContext'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from '../services/api'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'
import { getAuthUserFromToken } from '../utils/jwt'

interface StoredAuthUser {
  name: string | null
}

function readStoredUser() {
  const rawValue = localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredAuthUser
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}

function buildInitialAuthState() {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (!token) {
    return {
      token: null,
      user: null,
    }
  }

  const storedUser = readStoredUser()
  const user = getAuthUserFromToken(token, storedUser?.name ?? null)

  if (!user) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)

    return {
      token: null,
      user: null,
    }
  }

  return {
    token,
    user,
  }
}

function persistAuthSession(response: AuthResponse) {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token)
  localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify({
      name: response.name,
    } satisfies StoredAuthUser),
  )

  return getAuthUserFromToken(response.token, response.name)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(buildInitialAuthState)

  useEffect(() => {
    if (!authState.token || !authState.user) {
      return
    }

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authState.token)
    localStorage.setItem(
      AUTH_USER_STORAGE_KEY,
      JSON.stringify({
        name: authState.user.name,
      } satisfies StoredAuthUser),
    )
  }, [authState])

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload)
    const user = persistAuthSession(response)

    if (!user) {
      throw new Error('Authentication token could not be decoded.')
    }

    setAuthState({
      token: response.token,
      user,
    })

    return user
  }

  async function register(payload: RegisterPayload) {
    const response = await registerRequest(payload)
    const user = persistAuthSession(response)

    if (!user) {
      throw new Error('Authentication token could not be decoded.')
    }

    setAuthState({
      token: response.token,
      user,
    })

    return user
  }

  function logout() {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)

    setAuthState({
      token: null,
      user: null,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.user !== null && authState.token !== null,
        token: authState.token,
        user: authState.user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
