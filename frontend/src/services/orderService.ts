import api from './api'

import type {
  CustomerOrder,
  OrderPageResponse,
  PlaceOrderPayload,
  RawOrderPageResponse,
} from '../types/order'

interface GetOrdersParams {
  page?: number
  size?: number
}

function normalizeOrderPageResponse(data: RawOrderPageResponse): OrderPageResponse {
  return {
    content: data.content,
    page: {
      number: data.page?.number ?? data.number ?? 0,
      size: data.page?.size ?? data.size ?? data.content.length,
      totalElements: data.page?.totalElements ?? data.totalElements ?? data.content.length,
      totalPages: data.page?.totalPages ?? data.totalPages ?? 1,
    },
  }
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const response = await api.post<CustomerOrder>('/orders', payload)
  return response.data
}

export async function getOrders(params: GetOrdersParams) {
  const response = await api.get<RawOrderPageResponse>('/orders', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })

  return normalizeOrderPageResponse(response.data)
}

export async function getOrder(orderId: number) {
  const response = await api.get<CustomerOrder>(`/orders/${orderId}`)
  return response.data
}

export async function downloadOrderInvoice(orderId: number) {
  const response = await api.get<Blob>(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  })

  return response.data
}
