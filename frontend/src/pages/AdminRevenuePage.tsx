import { ChartLine, CurrencyDollar, TrendDown, TrendUp } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getRevenueAnalytics } from '../services/salesAnalyticsService'
import type { RevenueAnalytics, SalesDateRange } from '../types/adminSales'
import { getApiErrorMessage } from '../utils/apiError'
import { createDefaultSalesDateRange } from '../utils/adminSales'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: RevenueAnalytics | null
  error: string | null
  isLoading: boolean
}

const defaultDateRange = createDefaultSalesDateRange()

function AdminRevenuePage() {
  const [dateRange, setDateRange] = useState<SalesDateRange>(defaultDateRange)
  const [analyticsState, setAnalyticsState] = useState<AsyncState>({
    data: null,
    error: null,
    isLoading: true,
  })

  async function loadAnalytics(nextRange: SalesDateRange) {
    setAnalyticsState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    try {
      const analytics = await getRevenueAnalytics(nextRange)
      setAnalyticsState({
        data: analytics,
        error: null,
        isLoading: false,
      })
    } catch (error: unknown) {
      setAnalyticsState({
        data: null,
        error: getApiErrorMessage(error, 'Unable to load revenue analytics.'),
        isLoading: false,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loadAnalytics(dateRange)
  }

  useEffect(() => {
    let isActive = true

    async function initializeAnalytics() {
      try {
        const analytics = await getRevenueAnalytics(defaultDateRange)

        if (!isActive) {
          return
        }

        setAnalyticsState({
          data: analytics,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setAnalyticsState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load revenue analytics.'),
          isLoading: false,
        })
      }
    }

    void initializeAnalytics()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Sales Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
          Revenue dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Revenue reflects list-value sales before campaign reductions, while profit
          tracks the realized order value collected after discounts. Use the timeline
          below to review daily sales movement across a chosen range.
        </p>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="border border-parchment-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <ChartLine className="text-3xl text-crimson-700" />
            <div>
              <h2 className="font-serif text-3xl text-ink-900">Analysis range</h2>
              <p className="mt-2 text-sm text-ink-500">Refresh the daily revenue curve.</p>
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
              disabled={analyticsState.isLoading}
              type="submit"
            >
              <ChartLine className="text-sm" />
              {analyticsState.isLoading ? 'Refreshing...' : 'Update Dashboard'}
            </button>
          </form>
        </article>

        <div className="space-y-8">
          {analyticsState.error ? (
            <div className="border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {analyticsState.error}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analyticsState.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    className="h-40 animate-pulse border border-parchment-200 bg-white"
                    key={index}
                  />
                ))
              : null}

            {!analyticsState.isLoading && analyticsState.data ? (
              <>
                <article className="border border-parchment-200 bg-white p-6">
                  <CurrencyDollar className="text-2xl text-crimson-700" />
                  <p className="mt-5 text-[10px] uppercase tracking-nav text-ink-500">Revenue</p>
                  <p className="mt-3 font-serif text-4xl text-ink-900">
                    {formatCurrency(analyticsState.data.revenue)}
                  </p>
                </article>

                <article className="border border-parchment-200 bg-white p-6">
                  <TrendUp className="text-2xl text-crimson-700" />
                  <p className="mt-5 text-[10px] uppercase tracking-nav text-ink-500">Profit</p>
                  <p className="mt-3 font-serif text-4xl text-ink-900">
                    {formatCurrency(analyticsState.data.profit)}
                  </p>
                </article>

                <article className="border border-parchment-200 bg-white p-6">
                  <ChartLine className="text-2xl text-crimson-700" />
                  <p className="mt-5 text-[10px] uppercase tracking-nav text-ink-500">
                    Order Count
                  </p>
                  <p className="mt-3 font-serif text-4xl text-ink-900">
                    {analyticsState.data.orderCount}
                  </p>
                </article>

                <article className="border border-parchment-200 bg-white p-6">
                  <TrendDown className="text-2xl text-crimson-700" />
                  <p className="mt-5 text-[10px] uppercase tracking-nav text-ink-500">
                    Discounts
                  </p>
                  <p className="mt-3 font-serif text-4xl text-ink-900">
                    {formatCurrency(analyticsState.data.discountTotal)}
                  </p>
                </article>
              </>
            ) : null}
          </section>

          <section className="border border-parchment-200 bg-white p-6">
            <div className="border-b border-parchment-200 pb-4">
              <h2 className="font-serif text-3xl text-ink-900">Daily curve</h2>
              <p className="mt-2 text-sm text-ink-500">
                The chart plots gross revenue against realized profit for each day in the
                selected window.
              </p>
            </div>

            {analyticsState.isLoading ? (
              <div className="mt-6 h-[360px] animate-pulse border border-parchment-200 bg-parchment-50" />
            ) : null}

            {!analyticsState.isLoading && analyticsState.data ? (
              <div className="mt-6 h-[360px]">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart data={analyticsState.data.breakdown}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#c5a059" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#c5a059" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#7a2222" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#7a2222" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e8e5dc" strokeDasharray="2 6" vertical={false} />
                    <XAxis
                      axisLine={false}
                      dataKey="label"
                      tick={{ fill: '#78716c', fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tick={{ fill: '#78716c', fontSize: 12 }}
                      tickFormatter={(value: number) => `$${value}`}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fcfbf8',
                        border: '1px solid #e8e5dc',
                        borderRadius: 0,
                      }}
                      formatter={(value, name) => [
                        formatCurrency(Number(value ?? 0)),
                        name === 'revenue' ? 'Revenue' : 'Profit',
                      ]}
                      labelStyle={{ color: '#1c1917', fontWeight: 600 }}
                    />
                    <Area
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      fillOpacity={1}
                      name="revenue"
                      stroke="#c5a059"
                      strokeWidth={2}
                      type="monotone"
                    />
                    <Area
                      dataKey="profit"
                      fill="url(#profitGradient)"
                      fillOpacity={1}
                      name="profit"
                      stroke="#7a2222"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </section>

          {!analyticsState.isLoading && analyticsState.data ? (
            <section className="border border-parchment-200 bg-white p-6">
              <div className="border-b border-parchment-200 pb-4">
                <h2 className="font-serif text-3xl text-ink-900">Daily breakdown</h2>
                <p className="mt-2 text-sm text-ink-500">
                  Use the ledger view when you need exact day-by-day totals alongside order count.
                </p>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-parchment-200 text-left text-[10px] uppercase tracking-nav text-ink-500">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Revenue</th>
                      <th className="px-4 py-3 font-medium">Profit</th>
                      <th className="px-4 py-3 font-medium">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsState.data.breakdown.map((point) => (
                      <tr className="border-b border-parchment-200 bg-parchment-50/45" key={point.date}>
                        <td className="px-4 py-4 text-sm text-ink-800">{point.label}</td>
                        <td className="px-4 py-4 font-serif text-2xl text-ink-900">
                          {formatCurrency(point.revenue)}
                        </td>
                        <td className="px-4 py-4 font-serif text-2xl text-ink-900">
                          {formatCurrency(point.profit)}
                        </td>
                        <td className="px-4 py-4 text-sm text-ink-500">{point.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default AdminRevenuePage
