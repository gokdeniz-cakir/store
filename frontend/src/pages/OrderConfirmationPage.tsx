import { ArrowRight, CheckCircle, DownloadSimple, Receipt } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { downloadOrderInvoice, getOrder } from '../services/orderService'
import type { CustomerOrder } from '../types/order'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface OrderConfirmationState {
  data: CustomerOrder | null
  error: string | null
  isLoading: boolean
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString()
}

function OrderConfirmationPage() {
  const { orderId } = useParams()
  const parsedOrderId = Number(orderId)
  const hasValidOrderId = Number.isInteger(parsedOrderId) && parsedOrderId > 0
  const [confirmationState, setConfirmationState] = useState<OrderConfirmationState>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!hasValidOrderId) {
      setConfirmationState({
        data: null,
        error: 'The order confirmation could not be identified.',
        isLoading: false,
      })
      return
    }

    let isActive = true

    async function loadOrder() {
      try {
        const order = await getOrder(parsedOrderId)

        if (!isActive) {
          return
        }

        setConfirmationState({
          data: order,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setConfirmationState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load this order confirmation.'),
          isLoading: false,
        })
      }
    }

    void loadOrder()

    return () => {
      isActive = false
    }
  }, [hasValidOrderId, parsedOrderId])

  async function handleInvoiceDownload() {
    if (!hasValidOrderId) {
      return
    }

    setDownloadError(null)
    setIsDownloading(true)

    try {
      const invoiceBlob = await downloadOrderInvoice(parsedOrderId)
      const downloadUrl = window.URL.createObjectURL(invoiceBlob)
      const anchor = document.createElement('a')

      anchor.href = downloadUrl
      anchor.download = `aurelia-order-${parsedOrderId}-invoice.pdf`
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error: unknown) {
      setDownloadError(getApiErrorMessage(error, 'Unable to download the invoice right now.'))
    } finally {
      setIsDownloading(false)
    }
  }

  if (confirmationState.isLoading) {
    return (
      <main className="flex-1 bg-parchment-50 py-16">
        <div className="mx-auto max-w-content animate-pulse px-8">
          <div className="h-80 border border-parchment-200 bg-white" />
        </div>
      </main>
    )
  }

  if (!confirmationState.data) {
    return (
      <main className="flex-1 bg-parchment-50 py-20">
        <div className="mx-auto max-w-3xl border border-parchment-200 bg-white px-8 py-16 text-center">
          <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Confirmation Unavailable
          </p>
          <h1 className="mt-6 font-serif text-4xl text-ink-900">We could not confirm this order</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
            {confirmationState.error ?? 'The order confirmation is unavailable.'}
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 border border-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            to="/orders"
          >
            View Order History
            <ArrowRight className="text-sm" />
          </Link>
        </div>
      </main>
    )
  }

  const order = confirmationState.data

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto max-w-content px-8">
        <section className="overflow-hidden border border-parchment-200 bg-white">
          <div className="border-b border-parchment-200 bg-[#181410] px-8 py-10 text-white md:px-12">
            <div className="flex items-start gap-4">
              <CheckCircle className="mt-1 text-4xl text-gold-500" />
              <div>
                <p className="text-[10px] uppercase tracking-eyebrow text-gold-500">
                  Order Confirmed
                </p>
                <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-white">
                  Your invoice is ready
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                  Order #{order.id} was placed successfully on {formatOrderDate(order.createdAt)}.
                  You can download the PDF invoice now and review the full order record below.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                  Order #{order.id}
                </span>
                <span className="border border-parchment-200 bg-parchment-50 px-3 py-1 text-[10px] uppercase tracking-nav text-ink-800">
                  {order.status.replaceAll('_', ' ')}
                </span>
              </div>
              <h2 className="mt-5 font-serif text-4xl text-ink-900">
                {formatCurrency(order.totalPrice)}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500">
                Email delivery is available when SMTP credentials are configured for the backend.
                The downloadable PDF invoice is available immediately from this page.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {order.items.map((item) => (
                  <article
                    className="border border-parchment-200 bg-parchment-50 p-5"
                    key={`${order.id}-${item.bookId}`}
                  >
                    <p className="font-serif text-2xl text-ink-900">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{item.author}</p>
                    <div className="mt-4 space-y-2 text-sm text-ink-800">
                      <p>Quantity: {item.quantity}</p>
                      <p>Unit price: {formatCurrency(item.unitPrice)}</p>
                      <p>Line total: {formatCurrency(item.lineTotal)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
              <article className="border border-parchment-200 bg-parchment-100 p-8">
                <div className="flex items-center gap-3">
                  <Receipt className="text-2xl text-crimson-700" />
                  <h2 className="font-serif text-3xl text-ink-900">Invoice Access</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  Download the official PDF for your records or open the detailed order view.
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                    disabled={isDownloading}
                    onClick={handleInvoiceDownload}
                    type="button"
                  >
                    <DownloadSimple className="text-sm" />
                    {isDownloading ? 'Preparing Invoice...' : 'Download Invoice'}
                  </button>
                  <Link
                    className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                    to={`/orders/${order.id}`}
                  >
                    View Full Order
                    <ArrowRight className="text-sm" />
                  </Link>
                </div>

                {downloadError ? (
                  <div className="mt-4 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                    {downloadError}
                  </div>
                ) : null}
              </article>

              <article className="border border-parchment-200 bg-white p-8">
                <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                  Shipping Address
                </p>
                <p className="mt-4 text-sm leading-7 text-ink-500">{order.shippingAddress}</p>
              </article>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
