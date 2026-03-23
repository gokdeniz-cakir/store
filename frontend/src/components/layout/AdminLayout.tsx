import {
  BookOpenText,
  Books,
  ChartLine,
  Package,
  Percent,
  Quotes,
  Receipt,
  Rows,
  SignOut,
  SquaresFour,
  Tag,
} from '@phosphor-icons/react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

const productManagerLinks = [
  {
    description: 'Overview and current phase handoff',
    icon: SquaresFour,
    label: 'Dashboard',
    to: '/admin',
  },
  {
    description: 'Catalogue CRUD and edition editing',
    icon: Books,
    label: 'Books',
    to: '/admin/books',
  },
  {
    description: 'Curated shelf structure and icon mapping',
    icon: Tag,
    label: 'Categories',
    to: '/admin/categories',
  },
  {
    description: 'Advance orders through the delivery pipeline',
    icon: Package,
    label: 'Deliveries',
    to: '/admin/deliveries',
  },
  {
    description: 'Apply percentage discounts to selected editions',
    icon: Percent,
    label: 'Discounts',
    to: '/admin/discounts',
  },
  {
    description: 'Inline stock adjustments for live catalog quantities',
    icon: Rows,
    label: 'Stock',
    to: '/admin/stock',
  },
  {
    description: 'Approve or reject pending customer reviews',
    icon: Quotes,
    label: 'Reviews',
    to: '/admin/reviews',
  },
] as const

const salesManagerLinks = [
  {
    description: 'Overview and current campaign tooling',
    icon: SquaresFour,
    label: 'Dashboard',
    to: '/admin',
  },
  {
    description: 'Apply percentage discounts to selected editions',
    icon: Percent,
    label: 'Discounts',
    to: '/admin/discounts',
  },
  {
    description: 'Query invoices by date range and export PDFs',
    icon: Receipt,
    label: 'Invoices',
    to: '/admin/invoices',
  },
  {
    description: 'Track revenue, profit, discounts, and order cadence',
    icon: ChartLine,
    label: 'Revenue',
    to: '/admin/revenue',
  },
] as const

function AdminLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const isSalesManager = user?.role === 'SALES_MANAGER'
  const primaryLinks = isSalesManager ? salesManagerLinks : productManagerLinks

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#120f0d] text-white">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-r border-white/10 bg-[#16120f] px-6 py-8">
          <Link className="inline-block leading-none" to="/admin">
            <span className="block font-serif text-3xl tracking-tight text-white">AURELIA</span>
            <span className="mt-2 block text-[11px] uppercase tracking-[0.38em] text-slate-500">
              Admin
            </span>
          </Link>

          <div className="mt-10 border border-gold-500/20 bg-gold-500/10 p-5">
            <span className="text-[10px] uppercase tracking-eyebrow text-gold-500">
              Active Role
            </span>
            <p className="mt-3 font-serif text-2xl text-white">
              {user?.role.replaceAll('_', ' ')}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {isSalesManager
                ? 'Sales managers can run campaigns, export invoices, and review revenue performance from this surface.'
                : 'Product managers can edit the live catalog, moderate reviews, and advance deliveries from this surface.'}
            </p>
          </div>

          <nav className="mt-10 space-y-2">
            {primaryLinks.map((link) => {
              const Icon = link.icon

              return (
                <NavLink
                  className={({ isActive }) =>
                    `block border px-4 py-4 transition-colors ${
                      isActive
                        ? 'border-gold-500/50 bg-gold-500/10 text-white'
                        : 'border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  key={link.label}
                  to={link.to}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-xl text-gold-500" />
                    <div>
                      <p className="text-xs uppercase tracking-nav">{link.label}</p>
                      <p className="mt-1 text-sm normal-case tracking-normal text-slate-400">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </NavLink>
              )
            })}
          </nav>

          <div className="mt-10 flex flex-col gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
              to="/"
            >
              <BookOpenText className="text-sm" />
              Return To Storefront
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:border-crimson-700 hover:bg-crimson-700"
              onClick={handleLogout}
              type="button"
            >
              <SignOut className="text-sm" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="min-h-screen bg-parchment-50 text-ink-900">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
