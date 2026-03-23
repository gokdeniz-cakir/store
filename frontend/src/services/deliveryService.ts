import api from './api'

import type { AdminDelivery, DeliveryStatus } from '../types/delivery'

export async function getDeliveries() {
  const response = await api.get<AdminDelivery[]>('/admin/deliveries')
  return response.data
}

export async function updateDeliveryStatus(deliveryId: number, status: DeliveryStatus) {
  const response = await api.patch<AdminDelivery>(`/admin/deliveries/${deliveryId}/status`, {
    status,
  })
  return response.data
}
