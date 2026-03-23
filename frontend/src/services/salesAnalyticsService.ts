import api from './api'

import type { AdminInvoice, RevenueAnalytics, SalesDateRange } from '../types/adminSales'

export async function getAdminInvoices(params: SalesDateRange) {
  const response = await api.get<AdminInvoice[]>('/admin/invoices', {
    params,
  })

  return response.data
}

export async function getRevenueAnalytics(params: SalesDateRange) {
  const response = await api.get<RevenueAnalytics>('/admin/revenue', {
    params,
  })

  return response.data
}
