import type { SalesDateRange } from '../types/adminSales'

function padDateSegment(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateInput(date: Date) {
  return [
    date.getFullYear(),
    padDateSegment(date.getMonth() + 1),
    padDateSegment(date.getDate()),
  ].join('-')
}

export function createDefaultSalesDateRange(days = 30): SalesDateRange {
  const endDate = new Date()
  const startDate = new Date(endDate)

  startDate.setDate(endDate.getDate() - (days - 1))

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  }
}

export function formatAdminTimestamp(value: string) {
  return new Date(value).toLocaleString()
}

export function downloadPdf(blob: Blob, filename: string) {
  const downloadUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = downloadUrl
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(downloadUrl)
}
