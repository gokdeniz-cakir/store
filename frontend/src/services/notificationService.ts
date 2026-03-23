import api from './api'

import type { NotificationItem } from '../types/notification'

export async function getNotifications() {
  const response = await api.get<NotificationItem[]>('/notifications')
  return response.data
}

export async function markNotificationAsRead(notificationId: number) {
  const response = await api.patch<NotificationItem>(`/notifications/${notificationId}/read`)
  return response.data
}
