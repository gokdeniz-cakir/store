import {
  ArrowRight,
  Books,
  ChartLine,
  Package,
  Percent,
  Quotes,
  Receipt,
  Rows,
  Tag,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

const productManagerCards = [
  {
    description: 'Create, revise, and retire editions from the live storefront catalog.',
    icon: Books,
    label: 'Book Management',
    status: 'Active now',
    to: '/admin/books',
  },
  {
    description: 'Shape the editorial shelves and icon system that power storefront browsing.',
    icon: Tag,
    label: 'Category Management',
    status: 'Active now',
    to: '/admin/categories',
  },
  {
    description: 'Track each delivery line and advance statuses from processing to completion.',
    icon: Package,
    label: 'Delivery Management',
    status: 'Active now',
    to: '/admin/deliveries',
  },
  {
    description: 'Approve or reject pending customer reviews before they reach the storefront.',
    icon: Quotes,
    label: 'Review Moderation',
    status: 'Active now',
    to: '/admin/reviews',
  },
  {
    description: 'Adjust live quantities inline to keep stock aligned with the catalog.',
    icon: Rows,
    label: 'Stock Management',
    status: 'Active now',
    to: '/admin/stock',
  },
] as const

const salesManagerCards = [
  {
    description: 'Apply discount campaigns and notify customers with matching wishlists.',
    icon: Percent,
    label: 'Discount Management',
    status: 'Active now',
    to: '/admin/discounts',
  },
  {
    description: 'Review order invoices across any date range and download each PDF directly.',
    icon: Receipt,
    label: 'Invoice Management',
    status: 'Active now',
    to: '/admin/invoices',
  },
  {
    description: 'Track revenue, realized profit, order volume, and campaign impact over time.',
    icon: ChartLine,
    label: 'Revenue Analytics',
    status: 'Active now',
    to: '/admin/revenue',
  },
] as const

const productManagerRoadmap = [
  { icon: Books, label: 'Catalog editing', note: 'Live and storefront-backed' },
  { icon: Package, label: 'Delivery operations', note: 'Active status flow is live' },
  { icon: Rows, label: 'Stock controls', note: 'Inline updates are active' },
  { icon: Quotes, label: 'Review moderation', note: 'Approve or reject pending feedback' },
] as const

const salesManagerRoadmap = [
  { icon: Percent, label: 'Campaign tooling', note: 'Discounts and notifications are active' },
  { icon: Receipt, label: 'Invoice exports', note: 'Range query and PDF retrieval are live' },
  { icon: ChartLine, label: 'Revenue analytics', note: 'Daily charting and summary cards are active' },
  { icon: Package, label: 'Order ledger', note: 'Invoices map directly back to live orders' },
] as const

function AdminPortalPage() {
  const { user } = useAuth()
  const isProductManager = user?.role === 'PRODUCT_MANAGER'
  const launchCards = isProductManager ? productManagerCards : salesManagerCards
  const roadmap = isProductManager ? productManagerRoadmap : salesManagerRoadmap

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Admin Dashboard
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
          Manager operations
          <br />
          for Aurelia Editions
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-ink-500">
          You are signed in as {user?.role.replaceAll('_', ' ')}. The admin area now
          runs on its own layout, separate from the storefront, with live tooling tailored
          to your manager role.
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        {launchCards.map((card) => {
          const Icon = card.icon

          return (
            <article className="border border-parchment-200 bg-white p-6" key={card.label}>
              <div className="flex items-center justify-between gap-4">
                <Icon className="text-3xl text-crimson-700" />
                <span
                  className={`border px-3 py-1 text-[10px] uppercase tracking-nav ${
                    card.status === 'Active now'
                      ? 'border-gold-500/30 bg-gold-500/10 text-gold-600'
                      : 'border-parchment-200 bg-parchment-50 text-ink-500'
                  }`}
                >
                  {card.status}
                </span>
              </div>
              <h2 className="mt-6 font-serif text-3xl text-ink-900">{card.label}</h2>
              <p className="mt-4 text-sm leading-7 text-ink-500">{card.description}</p>
              <Link
                className="mt-8 inline-flex items-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                to={card.to}
              >
                Open Module
                <ArrowRight className="text-sm" />
              </Link>
            </article>
          )
        })}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="border border-parchment-200 bg-parchment-100 p-8">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Current Access
          </span>
          <h2 className="mt-5 font-serif text-3xl text-ink-900">
            {isProductManager ? 'Product operations are active' : 'Sales reporting is active'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-ink-500">
            {isProductManager
              ? 'You can maintain the live catalog, monitor deliveries, and moderate customer content used by the storefront.'
              : 'You can run discount campaigns, export invoices, and monitor sales performance without leaving the admin shell.'}
          </p>
        </article>

        <article className="border border-parchment-200 bg-white p-8">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Next Modules
          </span>
          <div className="mt-6 space-y-4">
            {roadmap.map((item) => {
              const Icon = item.icon

              return (
                <div
                  className="flex items-center gap-4 border border-parchment-200 bg-parchment-50 px-4 py-4"
                  key={item.label}
                >
                  <Icon className="text-2xl text-ink-500" />
                  <div>
                    <p className="text-sm font-medium text-ink-900">{item.label}</p>
                    <p className="mt-1 text-sm text-ink-500">{item.note}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>
    </main>
  )
}

export default AdminPortalPage
