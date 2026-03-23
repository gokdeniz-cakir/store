import { DownloadSimple, MagnifyingGlass, Receipt } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'

import { downloadOrderInvoice } from '../services/orderService'
import { getAdminInvoices } from '../services/salesAnalyticsService'
import type { AdminInvoice, SalesDateRange } from '../types/adminSales'
import { getApiErrorMessage } from '../utils/apiError'
import { createDefaultSalesDateRange, downloadPdf, formatAdminTimestamp } from '../utils/adminSales'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: AdminInvoice[]
  error: string | null
  isLoading: boolean
}

const defaultDateRange = createDefaultSalesDateRange()

function getInvoiceStatusLabel(status: string) {
  return status.replaceAll('_', ' ')
}

function AdminInvoicesPage() {
  const [dateRange, setDateRange] = useState<SalesDateRange>(defaultDateRange)
  const [invoiceState, setInvoiceState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [downloadingOrderId, setDownloadingOrderId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function loadInvoices(nextRange: SalesDateRange) {
    setInvoiceState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    try {
      const invoices = await getAdminInvoices(nextRange)
      setInvoiceState({
        data: invoices,
        error: null,
        isLoading: false,
      })
    } catch (error: unknown) {
      setInvoiceState({
        data: [],
        error: getApiErrorMessage(error, 'Unable to load invoices for the selected range.'),
        isLoading: false,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setActionError(null)
    await loadInvoices(dateRange)
  }

  async function handleDownload(invoice: AdminInvoice) {
    setActionError(null)
    setDownloadingOrderId(invoice.orderId)

    try {
      const invoiceBlob = await downloadOrderInvoice(invoice.orderId)
      downloadPdf(invoiceBlob, `aurelia-order-${invoice.orderId}-invoice.pdf`)
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to download this invoice right now.'))
    } finally {
      setDownloadingOrderId(null)
    }
  }

  useEffect(() => {
    let isActive = true

    async function initializeInvoices() {
      try {
        const invoices = await getAdminInvoices(defaultDateRange)

        if (!isActive) {
          return
        }

        setInvoiceState({
          data: invoices,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setInvoiceState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load invoices for the selected range.'),
          isLoading: false,
        })
      }
    }

    void initializeInvoices()

    return () => {
      isActive = false
    }
  }, [])

  const invoiceCount = invoiceState.data.length
  const billedTotal = invoiceState.data.reduce((sum, invoice) => sum + invoice.totalPrice, 0)
  const discountTotal = invoiceState.data.reduce((sum, invoice) => sum + invoice.discountTotal, 0)

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Sales Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
          Invoice management
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Query every order invoice within a selected date range, inspect customer
          billing totals, and download PDFs without leaving the admin surface.
        </p>
      </section>

      {actionError ? (
        <div className="mt-8 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
          {actionError}
        </div>
      ) : null}

      <section className="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="border border-parchment-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Receipt className="text-3xl text-crimson-700" />
            <div>
              <h2 className="font-serif text-3xl text-ink-900">Date range</h2>
              <p className="mt-2 text-sm text-ink-500">Filter issued invoices by order date.</p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                Start Date
              </span>
              <input
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setDateRange((currentRange) => ({
                    ...currentRange,
                    startDate: event.target.value,
                  }))
                }
                required
                type="date"
                value={dateRange.startDate}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                End Date
              </span>
              <input
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setDateRange((currentRange) => ({
                    ...currentRange,
                    endDate: event.target.value,
                  }))
                }
                required
                type="date"
                value={dateRange.endDate}
              />
            </label>

            <button
              className="inline-flex w-full items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
              disabled={invoiceState.isLoading}
              type="submit"
            >
              <MagnifyingGlass className="text-sm" />
              {invoiceState.isLoading ? 'Refreshing...' : 'Apply Range'}
            </button>
          </form>
        </article>

        <article className="border border-parchment-200 bg-white p-6">
          <div className="grid gap-4 border-b border-parchment-200 pb-5 md:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">Invoices</span>
              <p className="mt-3 font-serif text-3xl text-ink-900">{invoiceCount}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">Billed Total</span>
              <p className="mt-3 font-serif text-3xl text-ink-900">
                {formatCurrency(billedTotal)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">
                Discounts Captured
              </span>
              <p className="mt-3 font-serif text-3xl text-ink-900">
                {formatCurrency(discountTotal)}
              </p>
            </div>
          </div>

          {invoiceState.isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="h-20 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
              ))}
            </div>
          ) : null}

          {!invoiceState.isLoading && invoiceState.error ? (
            <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {invoiceState.error}
            </div>
          ) : null}

          {!invoiceState.isLoading && !invoiceState.error && invoiceState.data.length === 0 ? (
            <div className="mt-6 border border-parchment-200 bg-parchment-50 px-6 py-14 text-center">
              <Receipt className="mx-auto text-5xl text-ink-500" />
              <p className="mt-6 font-serif text-3xl text-ink-900">No invoices in this window</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
                Adjust the range to include order activity and the issued invoice list will
                populate here.
              </p>
            </div>
          ) : null}

          {!invoiceState.isLoading && !invoiceState.error && invoiceState.data.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-parchment-200 text-left text-[10px] uppercase tracking-nav text-ink-500">
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Issued</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceState.data.map((invoice) => (
                    <tr
                      className="border-b border-parchment-200 bg-parchment-50/45 align-top"
                      key={invoice.orderId}
                    >
                      <td className="px-4 py-4">
                        <p className="font-serif text-2xl text-ink-900">{invoice.invoiceNumber}</p>
                        <p className="mt-2 text-sm text-ink-500">Order #{invoice.orderId}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-800">
                        <p>{invoice.customerName}</p>
                        <p className="mt-2 text-ink-500">{invoice.customerEmail}</p>
                        <p className="mt-2 text-ink-500">{invoice.itemCount} items</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-500">
                        {formatAdminTimestamp(invoice.issuedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] uppercase tracking-nav text-gold-600">
                          {getInvoiceStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-serif text-2xl text-ink-900">
                          {formatCurrency(invoice.totalPrice)}
                        </p>
                        <p className="mt-2 text-sm text-ink-500">
                          Discount {formatCurrency(invoice.discountTotal)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="inline-flex items-center gap-2 border border-ink-900 px-4 py-2 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:border-parchment-200 disabled:text-ink-500"
                          disabled={downloadingOrderId === invoice.orderId}
                          onClick={() => handleDownload(invoice)}
                          type="button"
                        >
                          <DownloadSimple className="text-sm" />
                          {downloadingOrderId === invoice.orderId ? 'Preparing...' : 'PDF'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default AdminInvoicesPage
