import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'

interface PrivateRouteProps {
  allowedRoles?: UserRole[]
  children: ReactNode
}

function PrivateRoute({ allowedRoles, children }: PrivateRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`

    return <Navigate replace state={{ from: redirectPath }} to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/account" />
  }

  return <>{children}</>
}

export default PrivateRoute
