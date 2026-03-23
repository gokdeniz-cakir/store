import type { OrderItem } from './order'

export interface AdminRefundRequest {
  orderId: number
  customerName: string
  customerEmail: string
  shippingAddress: string
  status: string
  totalPrice: number
  refundAmount: number
  createdAt: string
  deliveredAt: string | null
  refundRequestedAt: string | null
  items: OrderItem[]
}
