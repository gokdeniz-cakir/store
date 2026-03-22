export type UserRole = 'CUSTOMER' | 'SALES_MANAGER' | 'PRODUCT_MANAGER'

export interface AuthUser {
  name: string | null
  email: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  tokenType: string
  name: string
  email: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  taxId?: string
  homeAddress?: string
}

export interface JwtPayload {
  sub?: string
  role?: string
  exp?: number
  iat?: number
}
