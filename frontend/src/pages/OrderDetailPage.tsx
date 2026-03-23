import { ArrowLeft, Package, Receipt } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { getOrder } from '../services/orderService'
import type { CustomerOrder } from '../types/order'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface OrderDetailState {
  data: CustomerOrder | null
  error: string | null
  isLoading: boolean
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString()
}

function OrderDetailPage() {
  const location = useLocation()
  const { orderId } = useParams()
  const parsedOrderId = Number(orderId)
  const hasValidOrderId = Number.isInteger(parsedOrderId) && parsedOrderId > 0
  const [orderDetailState, setOrderDetailState] = useState<OrderDetailState>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    if (!hasValidOrderId) {
      return
    }

    let isActive = true

    async function loadOrder() {
      try {
        const order = await getOrder(parsedOrderId)

        if (!isActive) {
          return
        }

        setOrderDetailState({
          data: order,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setOrderDetailState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load this order.'),
          isLoading: false,
        })
      }
    }

    void loadOrder()

    return () => {
      isActive = false
    }
  }, [hasValidOrderId, parsedOrderId])

  if (orderDetailState.isLoading) {
    return (
      <main className="flex-1 bg-parchment-50 py-16">
        <div className="mx-auto max-w-content animate-pulse px-8">
          <div className="h-64 border border-parchment-200 bg-white" />
        </div>
      </main>
    )
  }

  if (!hasValidOrderId || !orderDetailState.data) {
    return (
      <main className="flex-1 bg-parchment-50 py-20">
        <div className="mx-auto max-w-3xl border border-parchment-200 bg-white px-8 py-16 text-center">
          <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Order Unavailable
          </p>
          <h1 className="mt-6 font-serif text-4xl text-ink-900">We could not open this order</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
            {hasValidOrderId
              ? orderDetailState.error ?? 'The requested order does not exist.'
              : 'The selected order could not be identified.'}
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 border border-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            to="/orders"
          >
            <ArrowLeft className="text-sm" />
            Return To Orders
          </Link>
        </div>
      </main>
    )
  }

  const order = orderDetailState.data
  const notice =
    typeof location.state === 'object' && location.state && 'notice' in location.state
      ? String(location.state.notice)
      : null

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto max-w-content px-8">
        <Link
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-nav text-ink-500 transition-colors hover:text-crimson-700"
          to="/orders"
        >
          <ArrowLeft className="text-sm" />
          Back To Orders
        </Link>

        {notice ? (
          <div className="mt-6 border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
            {notice}
          </div>
        ) : null}

        <section className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-parchment-200 bg-white p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                Order #{order.id}
              </span>
              <span className="border border-parchment-200 bg-parchment-50 px-3 py-1 text-[10px] uppercase tracking-nav text-ink-800">
                {order.status.replaceAll('_', ' ')}
              </span>
            </div>

            <h1 className="mt-5 font-serif text-5xl leading-[1.05] text-ink-900">
              {formatCurrency(order.totalPrice)}
            </h1>
            <p className="mt-4 text-sm text-ink-500">Placed {formatOrderDate(order.createdAt)}</p>

            <div className="mt-8 space-y-5 border-t border-parchment-200 pt-8">
              {order.items.map((item) => (
                <article
                  className="grid gap-4 border border-parchment-200 bg-parchment-50 p-5 md:grid-cols-[minmax(0,1fr)_200px]"
                  key={`${order.id}-${item.bookId}`}
                >
                  <div>
                    <p className="font-serif text-2xl text-ink-900">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-500">{item.author}</p>
                    <p className="mt-3 text-sm text-ink-800">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink-500">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                    <p className="mt-2 font-serif text-2xl text-ink-900">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <article className="border border-parchment-200 bg-white p-8">
              <div className="flex items-center gap-3">
                <Package className="text-2xl text-crimson-700" />
                <h2 className="font-serif text-2xl text-ink-900">Shipping</h2>
              </div>
              <p className="mt-5 text-sm leading-7 text-ink-500">{order.shippingAddress}</p>
            </article>

            <article className="border border-parchment-200 bg-white p-8">
              <div className="flex items-center gap-3">
                <Receipt className="text-2xl text-crimson-700" />
                <h2 className="font-serif text-2xl text-ink-900">Summary</h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm text-ink-800">
                <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
                  <dt>Status</dt>
                  <dd>{order.status.replaceAll('_', ' ')}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
                  <dt>Items</dt>
                  <dd>{order.items.length}</dd>
                </div>
                <div className="flex items-center justify-between font-serif text-2xl text-ink-900">
                  <dt>Total</dt>
                  <dd>{formatCurrency(order.totalPrice)}</dd>
                </div>
              </dl>
            </article>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default OrderDetailPage
