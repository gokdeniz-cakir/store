import api from './api'

import type { AdminRefundRequest } from '../types/refund'

export async function getPendingRefunds() {
  const response = await api.get<AdminRefundRequest[]>('/admin/refunds')
  return response.data
}

export async function approveRefund(orderId: number) {
  const response = await api.patch<AdminRefundRequest>(`/admin/refunds/${orderId}/approve`)
  return response.data
}

export async function rejectRefund(orderId: number) {
  const response = await api.patch<AdminRefundRequest>(`/admin/refunds/${orderId}/reject`)
  return response.data
}
