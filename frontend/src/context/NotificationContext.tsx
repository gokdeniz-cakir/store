import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { NotificationContext } from './notificationContext'
import { useAuth } from '../hooks/useAuth'
import { getNotifications, markNotificationAsRead } from '../services/notificationService'
import type { NotificationItem } from '../types/notification'
import { getApiErrorMessage } from '../utils/apiError'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER'

  const loadNotifications = useCallback(async () => {
    if (!isCustomer) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const items = await getNotifications()
      setNotifications(items)
    } catch (error: unknown) {
      console.error(getApiErrorMessage(error, 'Unable to load notifications.'))
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [isCustomer])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications, user?.email])

  async function refresh() {
    await loadNotifications()
  }

  async function markAsRead(notificationId: number) {
    const updatedNotification = await markNotificationAsRead(notificationId)

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === updatedNotification.id ? updatedNotification : notification,
      ),
    )
  }

  return (
    <NotificationContext.Provider
      value={{
        isLoading,
        markAsRead,
        notifications,
        refresh,
        unreadCount: notifications.filter((notification) => !notification.read).length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
