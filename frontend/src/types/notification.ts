export interface NotificationItem {
  id: number
  bookId: number
  bookTitle: string
  message: string
  read: boolean
  createdAt: string
}

export interface NotificationContextValue {
  isLoading: boolean
  markAsRead: (notificationId: number) => Promise<void>
  notifications: NotificationItem[]
  refresh: () => Promise<void>
  unreadCount: number
}
