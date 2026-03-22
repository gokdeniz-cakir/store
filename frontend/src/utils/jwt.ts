import type { AuthUser, JwtPayload, UserRole } from '../types/auth'

function normalizeRole(role: string | undefined): UserRole | null {
  if (!role) {
    return null
  }

  const normalizedRole = role.startsWith('ROLE_') ? role.slice(5) : role

  if (
    normalizedRole === 'CUSTOMER' ||
    normalizedRole === 'SALES_MANAGER' ||
    normalizedRole === 'PRODUCT_MANAGER'
  ) {
    return normalizedRole
  }

  return null
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split('.')

  if (segments.length !== 3) {
    return null
  }

  const payload = segments[1]
  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    '=',
  )

  try {
    return JSON.parse(atob(paddedPayload)) as JwtPayload
  } catch {
    return null
  }
}

export function getAuthUserFromToken(
  token: string,
  storedName: string | null,
): AuthUser | null {
  const payload = decodeJwtPayload(token)
  const role = normalizeRole(payload?.role)
  const email = payload?.sub?.trim().toLowerCase()

  if (!role || !email) {
    return null
  }

  if (payload?.exp && payload.exp * 1000 <= Date.now()) {
    return null
  }

  return {
    name: storedName,
    email,
    role,
  }
}
