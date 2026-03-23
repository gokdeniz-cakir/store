import { ArrowRight, Package, Truck } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { getDeliveries, updateDeliveryStatus } from '../services/deliveryService'
import type { AdminDelivery, DeliveryStatus } from '../types/delivery'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: AdminDelivery[]
  error: string | null
  isLoading: boolean
}

function getNextStatus(status: DeliveryStatus) {
  switch (status) {
    case 'PROCESSING':
      return 'IN_TRANSIT' as const
    case 'IN_TRANSIT':
      return 'DELIVERED' as const
    default:
      return null
  }
}

function getStatusLabel(status: DeliveryStatus) {
  return status.replaceAll('_', ' ')
}

function getStatusClassName(status: DeliveryStatus) {
  switch (status) {
    case 'PROCESSING':
      return 'border-gold-500/30 bg-gold-500/10 text-gold-600'
    case 'IN_TRANSIT':
      return 'border-ink-900/15 bg-parchment-100 text-ink-800'
    case 'DELIVERED':
      return 'border-crimson-700/20 bg-crimson-700/5 text-crimson-800'
  }
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString()
}

function AdminDeliveriesPage() {
  const [deliveryState, setDeliveryState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadDeliveries() {
      try {
        const deliveries = await getDeliveries()

        if (!isActive) {
          return
        }

        setDeliveryState({
          data: deliveries,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setDeliveryState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load delivery records.'),
          isLoading: false,
        })
      }
    }

    void loadDeliveries()

    return () => {
      isActive = false
    }
  }, [])

  async function handleAdvance(delivery: AdminDelivery) {
    const nextStatus = getNextStatus(delivery.status)

    if (!nextStatus) {
      return
    }

    setActionError(null)
    setUpdatingDeliveryId(delivery.id)

    try {
      const updatedDelivery = await updateDeliveryStatus(delivery.id, nextStatus)
      setDeliveryState((currentState) => ({
        ...currentState,
        data: currentState.data.map((item) =>
          item.orderId === updatedDelivery.orderId
            ? {
                ...item,
                status: updatedDelivery.status,
                updatedAt: updatedDelivery.updatedAt,
              }
            : item,
        ),
      }))
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to update this delivery status.'))
    } finally {
      setUpdatingDeliveryId(null)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Product Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
          Delivery management
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Review every delivered line item, verify customer details, and advance the
          operational status through the live order lifecycle.
        </p>
      </section>

      {actionError ? (
        <div className="mt-8 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
          {actionError}
        </div>
      ) : null}

      <section className="mt-8 border border-parchment-200 bg-white p-6">
        <div className="grid gap-4 border-b border-parchment-200 pb-5 md:grid-cols-3">
          <div>
            <span className="text-[10px] uppercase tracking-nav text-ink-500">Delivery Rows</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">{deliveryState.data.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-nav text-ink-500">In Transit</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">
              {deliveryState.data.filter((delivery) => delivery.status === 'IN_TRANSIT').length}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-nav text-ink-500">Delivered</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">
              {deliveryState.data.filter((delivery) => delivery.status === 'DELIVERED').length}
            </p>
          </div>
        </div>

        {deliveryState.isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-36 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
            ))}
          </div>
        ) : null}

        {!deliveryState.isLoading && deliveryState.error ? (
          <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
            {deliveryState.error}
          </div>
        ) : null}

        {!deliveryState.isLoading && !deliveryState.error && deliveryState.data.length === 0 ? (
          <div className="mt-6 border border-parchment-200 bg-parchment-50 px-6 py-12 text-center">
            <Package className="mx-auto text-5xl text-ink-500" />
            <p className="mt-6 font-serif text-3xl text-ink-900">No deliveries yet</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
              Delivery rows will appear here once customers place orders.
            </p>
          </div>
        ) : null}

        {!deliveryState.isLoading && deliveryState.data.length > 0 ? (
          <div className="mt-6 space-y-4">
            {deliveryState.data.map((delivery) => {
              const nextStatus = getNextStatus(delivery.status)

              return (
                <article
                  className="grid gap-5 border border-parchment-200 bg-parchment-50 p-5 xl:grid-cols-[minmax(0,1fr)_260px]"
                  key={delivery.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                        Delivery #{delivery.id}
                      </span>
                      <span
                        className={`border px-3 py-1 text-[10px] uppercase tracking-nav ${getStatusClassName(delivery.status)}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <h2 className="mt-4 font-serif text-3xl text-ink-900">{delivery.bookTitle}</h2>
                    <p className="mt-2 text-sm text-ink-500">
                      Order #{delivery.orderId} · Qty {delivery.quantity} ·{' '}
                      {formatCurrency(delivery.totalPrice)}
                    </p>
                    <div className="mt-5 grid gap-4 text-sm text-ink-800 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-nav text-ink-500">Customer</p>
                        <p className="mt-1">{delivery.customerName ?? 'Aurelia customer'}</p>
                        <p className="mt-1 text-ink-500">{delivery.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-nav text-ink-500">
                          Shipping Address
                        </p>
                        <p className="mt-1 leading-7">{delivery.shippingAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-5 border-l border-parchment-200 pl-5">
                    <div className="space-y-3 text-sm text-ink-500">
                      <p>Created {formatTimestamp(delivery.createdAt)}</p>
                      <p>Last updated {formatTimestamp(delivery.updatedAt)}</p>
                    </div>

                    {nextStatus ? (
                      <button
                        className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                        disabled={updatingDeliveryId === delivery.id}
                        onClick={() => handleAdvance(delivery)}
                        type="button"
                      >
                        <Truck className="text-sm" />
                        {updatingDeliveryId === delivery.id
                          ? 'Updating...'
                          : `Mark ${getStatusLabel(nextStatus)}`}
                        <ArrowRight className="text-sm" />
                      </button>
                    ) : (
                      <div className="border border-gold-500/20 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
                        This delivery has completed the current status flow.
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default AdminDeliveriesPage
