import api from './api'

import type { Book } from '../types/catalog'

interface ApplyDiscountPayload {
  bookIds: number[]
  percentage: number
}

export async function applyDiscount(payload: ApplyDiscountPayload) {
  const response = await api.post<Book[]>('/admin/discounts', payload)
  return response.data
}
