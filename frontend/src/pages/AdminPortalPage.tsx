import {
  ArrowRight,
  Books,
  ChartLine,
  Package,
  Percent,
  Quotes,
  Rows,
  Tag,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

const launchCards = [
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
    description: 'Apply discount campaigns and notify customers with matching wishlists.',
    icon: Percent,
    label: 'Discount Management',
    status: 'Active now',
    to: '/admin/discounts',
  },
] as const

const roadmap = [
  { icon: Quotes, label: 'Review moderation', note: 'Active now' },
  { icon: ChartLine, label: 'Revenue analytics', note: 'Pending Phase 7 task' },
  { icon: Package, label: 'Delivery dashboards', note: 'More workflow depth arrives next' },
  { icon: Rows, label: 'Stock controls', note: 'Active now' },
] as const

function AdminPortalPage() {
  const { user } = useAuth()
  const isProductManager = user?.role === 'PRODUCT_MANAGER'

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
          runs on its own layout, separate from the storefront, and product-management
          controls for books and categories are live.
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
            {isProductManager ? 'Product management is active' : 'Sales manager preview'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-ink-500">
            {isProductManager
              ? 'You can now maintain the live books and categories used by the storefront.'
              : 'The shared admin shell is active for your role, but sales-specific tooling lands in later Phase 7 tasks.'}
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
