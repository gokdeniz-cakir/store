export interface SalesDateRange {
  startDate: string
  endDate: string
}

export interface AdminInvoice {
  orderId: number
  invoiceNumber: string
  customerName: string
  customerEmail: string
  status: string
  itemCount: number
  totalPrice: number
  discountTotal: number
  issuedAt: string
}

export interface RevenueBreakdownPoint {
  date: string
  label: string
  revenue: number
  profit: number
  orderCount: number
}

export interface RevenueAnalytics {
  startDate: string
  endDate: string
  revenue: number
  profit: number
  discountTotal: number
  orderCount: number
  breakdown: RevenueBreakdownPoint[]
}
