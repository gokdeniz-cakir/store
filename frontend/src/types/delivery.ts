export type DeliveryStatus = 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED'

export interface AdminDelivery {
  id: number
  orderId: number
  bookId: number
  bookTitle: string
  customerName: string | null
  customerEmail: string
  quantity: number
  totalPrice: number
  shippingAddress: string
  status: DeliveryStatus
  createdAt: string
  updatedAt: string
}
