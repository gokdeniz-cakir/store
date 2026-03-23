export interface OrderItem {
  bookId: number
  title: string
  author: string
  coverColor: string
  quantity: number
  unitPrice: number
  discountApplied: number
  lineTotal: number
}

export interface CustomerOrder {
  id: number
  totalPrice: number
  status: string
  shippingAddress: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderPageMetadata {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface OrderPageResponse {
  content: CustomerOrder[]
  page: OrderPageMetadata
}

export interface RawOrderPageResponse {
  content: CustomerOrder[]
  page?: Partial<OrderPageMetadata>
  size?: number
  number?: number
  totalElements?: number
  totalPages?: number
}

export interface PlaceOrderPayload {
  shippingAddress: string
  creditCard: {
    cardNumber: string
    cardholderName: string
    expiryMonth: number
    expiryYear: number
  }
  items: Array<{
    bookId: number
    quantity: number
  }>
}
