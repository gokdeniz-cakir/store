import {
  ArrowRight,
  BookmarksSimple,
  Buildings,
  Receipt,
  ShoppingBagOpen,
  SignOut,
  ShieldStar,
} from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/catalog'

function AccountPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { itemCount, subtotal } = useCart()

  if (!user) {
    return null
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-24">
      <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="border border-parchment-200 bg-white p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Account Overview
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink-900">
            Welcome back,
            <br />
            {user.name ?? 'Reader'}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-ink-500">
            Your storefront identity is active, your customer routes are protected,
            and your current session can move directly into checkout and order review.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="border border-parchment-200 bg-parchment-50 p-6">
              <div className="flex items-center gap-3">
                <Buildings className="text-2xl text-crimson-700" />
                <h2 className="font-serif text-2xl text-ink-900">Profile</h2>
              </div>
              <dl className="mt-6 space-y-4 text-sm text-ink-800">
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-500">
                    Name
                  </dt>
                  <dd className="mt-1 text-base text-ink-900">{user.name ?? 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-500">
                    Email
                  </dt>
                  <dd className="mt-1 text-base text-ink-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-500">
                    Role
                  </dt>
                  <dd className="mt-1 text-base text-ink-900">
                    {user.role.replace('_', ' ')}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="border border-parchment-200 bg-[#16120f] p-6 text-white">
              <div className="flex items-center gap-3">
                <BookmarksSimple className="text-2xl text-gold-500" />
                <h2 className="font-serif text-2xl">Session Status</h2>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">
                Your JWT is persisted locally and will authorize subsequent API calls
                through the shared Axios client.
              </p>
              <button
                className="mt-8 inline-flex items-center gap-2 border border-white px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
                onClick={handleLogout}
                type="button"
              >
                <SignOut className="text-sm" />
                Sign Out
              </button>
            </article>
          </div>
        </section>

        <aside className="space-y-6">
          {user.role !== 'CUSTOMER' ? (
            <article className="border border-gold-500/40 bg-[#1b1713] p-8 text-white">
              <div className="flex items-center gap-3">
                <ShieldStar className="text-2xl text-gold-500" />
                <h2 className="font-serif text-2xl">Manager Access</h2>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Your role unlocks protected admin routes. The full panel arrives in
                Phase 7, but the role-gated entry point is already active.
              </p>
              <Link
                className="mt-8 inline-block bg-gold-500 px-6 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-gold-600"
                to="/admin"
              >
                Enter Admin Portal
              </Link>
            </article>
          ) : null}

          {user.role === 'CUSTOMER' ? (
            <>
              <article className="border border-parchment-200 bg-parchment-100 p-8">
                <div className="flex items-center gap-3">
                  <ShoppingBagOpen className="text-2xl text-crimson-700" />
                  <h2 className="font-serif text-3xl text-ink-900">Cart Snapshot</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  Your guest-safe cart is available inside the authenticated session and
                  ready for checkout.
                </p>
                <dl className="mt-6 space-y-4 text-sm text-ink-800">
                  <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
                    <dt>Items in cart</dt>
                    <dd>{itemCount}</dd>
                  </div>
                  <div className="flex items-center justify-between font-serif text-2xl text-ink-900">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                    to={itemCount > 0 ? '/checkout' : '/cart'}
                  >
                    {itemCount > 0 ? 'Proceed To Checkout' : 'Open Cart'}
                    <ArrowRight className="text-sm" />
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                    to="/cart"
                  >
                    Review Cart
                  </Link>
                </div>
              </article>

              <article className="border border-parchment-200 bg-white p-8">
                <div className="flex items-center gap-3">
                  <Receipt className="text-2xl text-crimson-700" />
                  <h2 className="font-serif text-3xl text-ink-900">Order Archive</h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  Browse previous orders, inspect line items, and verify shipping details
                  from your customer record.
                </p>
                <Link
                  className="mt-6 inline-flex items-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                  to="/orders"
                >
                  View Order History
                  <ArrowRight className="text-sm" />
                </Link>
              </article>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  )
}

export default AccountPage
