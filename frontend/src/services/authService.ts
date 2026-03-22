import api from './api'

import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth'

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>('/auth/register', payload)
  return response.data
}
