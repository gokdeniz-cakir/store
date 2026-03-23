import { CheckCircle, ClockCounterClockwise, XCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { approveRefund, getPendingRefunds, rejectRefund } from '../services/refundService'
import type { AdminRefundRequest } from '../types/refund'
import { getApiErrorMessage } from '../utils/apiError'
import { formatAdminTimestamp } from '../utils/adminSales'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: AdminRefundRequest[]
  error: string | null
  isLoading: boolean
}

function AdminRefundsPage() {
  const [refundState, setRefundState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [actionError, setActionError] = useState<string | null>(null)
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadRefunds() {
      try {
        const refunds = await getPendingRefunds()

        if (!isActive) {
          return
        }

        setRefundState({
          data: refunds,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setRefundState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load pending refund requests.'),
          isLoading: false,
        })
      }
    }

    void loadRefunds()

    return () => {
      isActive = false
    }
  }, [])

  async function handleApprove(orderId: number) {
    setActionError(null)
    setProcessingOrderId(orderId)

    try {
      await approveRefund(orderId)
      setRefundState((currentState) => ({
        ...currentState,
        data: currentState.data.filter((refund) => refund.orderId !== orderId),
      }))
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to approve this refund request.'))
    } finally {
      setProcessingOrderId(null)
    }
  }

  async function handleReject(orderId: number) {
    setActionError(null)
    setProcessingOrderId(orderId)

    try {
      await rejectRefund(orderId)
      setRefundState((currentState) => ({
        ...currentState,
        data: currentState.data.filter((refund) => refund.orderId !== orderId),
      }))
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to reject this refund request.'))
    } finally {
      setProcessingOrderId(null)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Sales Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
          Refund management
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Review pending customer refund requests, inspect the original order detail, and
          resolve each request by approving stock restoration or rejecting the claim.
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
            <span className="text-[10px] uppercase tracking-nav text-ink-500">Pending Requests</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">{refundState.data.length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-nav text-ink-500">Refund Value</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">
              {formatCurrency(
                refundState.data.reduce((sum, refund) => sum + refund.refundAmount, 0),
              )}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-nav text-ink-500">Orders In Queue</span>
            <p className="mt-3 font-serif text-3xl text-ink-900">{refundState.data.length}</p>
          </div>
        </div>

        {refundState.isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-40 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
            ))}
          </div>
        ) : null}

        {!refundState.isLoading && refundState.error ? (
          <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
            {refundState.error}
          </div>
        ) : null}

        {!refundState.isLoading && !refundState.error && refundState.data.length === 0 ? (
          <div className="mt-6 border border-parchment-200 bg-parchment-50 px-6 py-14 text-center">
            <ClockCounterClockwise className="mx-auto text-5xl text-ink-500" />
            <p className="mt-6 font-serif text-3xl text-ink-900">No pending refunds</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
              New customer refund requests will appear here as they arrive.
            </p>
          </div>
        ) : null}

        {!refundState.isLoading && !refundState.error && refundState.data.length > 0 ? (
          <div className="mt-6 space-y-4">
            {refundState.data.map((refund) => (
              <article
                className="grid gap-6 border border-parchment-200 bg-parchment-50 p-6 xl:grid-cols-[minmax(0,1fr)_240px]"
                key={refund.orderId}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                      Order #{refund.orderId}
                    </span>
                    <span className="border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[10px] uppercase tracking-nav text-gold-600">
                      {refund.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl text-ink-900">{refund.customerName}</h2>
                  <p className="mt-2 text-sm text-ink-500">{refund.customerEmail}</p>
                  <div className="mt-5 grid gap-4 text-sm text-ink-800 md:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-nav text-ink-500">Requested</p>
                      <p className="mt-2">
                        {refund.refundRequestedAt
                          ? formatAdminTimestamp(refund.refundRequestedAt)
                          : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-nav text-ink-500">Delivered</p>
                      <p className="mt-2">
                        {refund.deliveredAt ? formatAdminTimestamp(refund.deliveredAt) : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-nav text-ink-500">Refund Amount</p>
                      <p className="mt-2 font-serif text-2xl text-ink-900">
                        {formatCurrency(refund.refundAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-parchment-200 pt-6">
                    <p className="text-[10px] uppercase tracking-nav text-ink-500">Shipping Address</p>
                    <p className="mt-2 text-sm leading-7 text-ink-500">{refund.shippingAddress}</p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {refund.items.map((item) => (
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 border border-parchment-200 bg-white px-4 py-4"
                        key={`${refund.orderId}-${item.bookId}`}
                      >
                        <div>
                          <p className="font-medium text-ink-900">{item.title}</p>
                          <p className="mt-1 text-sm text-ink-500">
                            {item.author} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="font-serif text-2xl text-ink-900">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-l border-parchment-200 pl-6">
                  <button
                    className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                    disabled={processingOrderId === refund.orderId}
                    onClick={() => handleApprove(refund.orderId)}
                    type="button"
                  >
                    <CheckCircle className="text-sm" />
                    {processingOrderId === refund.orderId ? 'Updating...' : 'Approve Refund'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:border-parchment-200 disabled:text-ink-500"
                    disabled={processingOrderId === refund.orderId}
                    onClick={() => handleReject(refund.orderId)}
                    type="button"
                  >
                    <XCircle className="text-sm" />
                    {processingOrderId === refund.orderId ? 'Updating...' : 'Reject Request'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default AdminRefundsPage
