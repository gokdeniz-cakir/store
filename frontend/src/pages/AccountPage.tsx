import { BookmarksSimple, Buildings, SignOut, ShieldStar } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function AccountPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

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
            Your current storefront identity is active and ready for subsequent phases
            like cart, checkout, and order history.
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

          <article className="border border-parchment-200 bg-parchment-100 p-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Next Phase
            </span>
            <h2 className="mt-4 font-serif text-3xl text-ink-900">Ready for the cart</h2>
            <p className="mt-4 text-sm leading-7 text-ink-500">
              The storefront auth flow is complete, so the next backend and frontend
              slices can build directly on this persisted session state.
            </p>
          </article>
        </aside>
      </div>
    </main>
  )
}

export default AccountPage
