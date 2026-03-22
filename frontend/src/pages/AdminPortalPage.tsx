import { LockKey, ShieldChevron, Stack } from '@phosphor-icons/react'

import { useAuth } from '../hooks/useAuth'

function AdminPortalPage() {
  const { user } = useAuth()

  return (
    <main className="flex-1 bg-[#120f0d] py-16 text-white md:py-24">
      <div className="mx-auto max-w-content px-8">
        <div className="border border-white/10 bg-white/5 p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-eyebrow text-gold-500">
            Protected Route
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05]">
            Admin portal access
            <br />
            is role-gated
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            You are authenticated as {user?.role.replace('_', ' ')}. This placeholder
            route confirms the frontend role check while the full admin interface is
            still pending later phases.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="border border-white/10 p-6">
              <ShieldChevron className="text-3xl text-gold-500" />
              <h2 className="mt-5 font-serif text-2xl">Security</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Only `SALES_MANAGER` and `PRODUCT_MANAGER` roles can enter this route.
              </p>
            </article>

            <article className="border border-white/10 p-6">
              <LockKey className="text-3xl text-gold-500" />
              <h2 className="mt-5 font-serif text-2xl">JWT Driven</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Authorization state is restored from the persisted JWT on refresh.
              </p>
            </article>

            <article className="border border-white/10 p-6">
              <Stack className="text-3xl text-gold-500" />
              <h2 className="mt-5 font-serif text-2xl">Phase Ready</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The route exists now so Phase 7 can plug into an already-protected
                entry point.
              </p>
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminPortalPage
