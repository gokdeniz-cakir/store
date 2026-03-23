import { ArrowRight, Receipt } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getOrders } from '../services/orderService'
import type { CustomerOrder, OrderPageResponse } from '../types/order'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface OrderHistoryState {
  data: OrderPageResponse | null
  error: string | null
  isLoading: boolean
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString()
}

function OrderHistoryPage() {
  const [orderHistoryState, setOrderHistoryState] = useState<OrderHistoryState>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    async function loadOrders() {
      try {
        const orders = await getOrders({ page: 0, size: 20 })

        if (!isActive) {
          return
        }

        setOrderHistoryState({
          data: orders,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setOrderHistoryState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load your order history.'),
          isLoading: false,
        })
      }
    }

    void loadOrders()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto max-w-content px-8">
        <div className="mb-8">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Order History
          </span>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink-900">
            Your placed orders
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-500">
            Review order totals, statuses, and shipping details from the authenticated
            customer account.
          </p>
        </div>

        {orderHistoryState.isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-36 animate-pulse border border-parchment-200 bg-white" key={index} />
            ))}
          </div>
        ) : null}

        {!orderHistoryState.isLoading && orderHistoryState.error ? (
          <div className="border border-crimson-700/20 bg-white px-8 py-12 text-center">
            <p className="font-serif text-3xl text-ink-900">Order history unavailable</p>
            <p className="mt-4 text-sm leading-7 text-ink-500">{orderHistoryState.error}</p>
          </div>
        ) : null}

        {!orderHistoryState.isLoading && !orderHistoryState.error && orderHistoryState.data?.content.length === 0 ? (
          <div className="border border-parchment-200 bg-white px-8 py-16 text-center">
            <Receipt className="mx-auto text-5xl text-ink-500" />
            <p className="mt-6 font-serif text-3xl text-ink-900">No orders yet</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
              Complete checkout from the cart to create your first order record.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
              to="/books"
            >
              Browse Catalogue
              <ArrowRight className="text-sm" />
            </Link>
          </div>
        ) : null}

        {!orderHistoryState.isLoading && orderHistoryState.data?.content.length ? (
          <div className="space-y-6">
            {orderHistoryState.data.content.map((order: CustomerOrder) => (
              <article
                className="grid gap-6 border border-parchment-200 bg-white p-6 md:grid-cols-[minmax(0,1fr)_220px]"
                key={order.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                      Order #{order.id}
                    </span>
                    <span className="border border-parchment-200 bg-parchment-50 px-3 py-1 text-[10px] uppercase tracking-nav text-ink-800">
                      {order.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl text-ink-900">
                    {formatCurrency(order.totalPrice)}
                  </h2>
                  <p className="mt-3 text-sm text-ink-500">
                    Placed {formatOrderDate(order.createdAt)}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-ink-500">{order.shippingAddress}</p>
                  <p className="mt-4 text-sm text-ink-800">
                    {order.items.length} line item{order.items.length === 1 ? '' : 's'}
                  </p>
                  {order.status === 'REFUND_REQUESTED' ? (
                    <p className="mt-3 text-sm text-crimson-800">
                      Refund request submitted for {formatCurrency(order.refundAmount)}.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between gap-6 border-l border-parchment-200 pl-6">
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div className="text-sm" key={`${order.id}-${item.bookId}`}>
                        <p className="font-medium text-ink-900">{item.title}</p>
                        <p className="text-ink-500">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                    to={`/orders/${order.id}`}
                  >
                    View Order
                    <ArrowRight className="text-sm" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default OrderHistoryPage
