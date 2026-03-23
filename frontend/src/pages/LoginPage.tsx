import { ArrowRight, SealCheck, ShieldCheck, UserCircle } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import type { UserRole } from '../types/auth'
import { getApiErrorMessage } from '../utils/apiError'

const sellingPoints = [
  'Track current and past orders',
  'Maintain your personal library profile',
  'Access manager tooling with role-based permissions',
] as const

function getDefaultRedirect(role: UserRole) {
  return role === 'CUSTOMER' ? '/account' : '/admin'
}

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, login, user } = useAuth()
  const { showToast } = useToast()

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated && user) {
    return <Navigate replace to={getDefaultRedirect(user.role)} />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login(formState)
      const redirectTarget =
        typeof location.state?.from === 'string'
          ? location.state.from
          : getDefaultRedirect(authenticatedUser.role)

      showToast({
        message: `Signed in as ${authenticatedUser.email}.`,
        title: 'Welcome Back',
        tone: 'success',
      })
      navigate(redirectTarget, { replace: true })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to sign in at the moment.')
      setErrorMessage(message)
      showToast({
        message,
        title: 'Sign In Failed',
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-24">
      <div className="mx-auto grid max-w-content gap-12 px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-[#191613] px-8 py-12 text-white md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.18),transparent_35%),linear-gradient(160deg,rgba(255,255,255,0.05),transparent_55%)]" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 border border-gold-500/40 px-3 py-1 text-[10px] uppercase tracking-eyebrow text-gold-500">
              <ShieldCheck className="text-sm" />
              Collector Access
            </span>
            <h1 className="mt-8 font-serif text-5xl leading-[1.05] text-white">
              Return to your
              <br />
              Aurelia account
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
              Sign in to continue browsing fine editions, review your saved details,
              and access the permissions attached to your role.
            </p>

            <div className="mt-12 space-y-4">
              {sellingPoints.map((point) => (
                <div
                  className="flex items-start gap-3 border-t border-white/10 pt-4 text-sm text-slate-300"
                  key={point}
                >
                  <SealCheck className="mt-0.5 text-lg text-gold-500" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 border border-white/10 bg-white/5 p-6">
              <span className="text-[10px] uppercase tracking-eyebrow text-gold-500">
                New to Aurelia?
              </span>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Create a customer account to preserve your details and prepare for
                checkout.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 border border-white px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:border-gold-500 hover:bg-gold-500 hover:text-ink-900"
                to="/register"
              >
                Create Account
                <ArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border border-parchment-200 bg-white p-8 md:p-12">
          <div className="flex items-center gap-3 text-ink-500">
            <UserCircle className="text-3xl text-crimson-700" />
            <div>
              <span className="block text-[10px] uppercase tracking-eyebrow text-crimson-700">
                Sign In
              </span>
              <p className="text-sm text-ink-500">Use your Aurelia credentials.</p>
            </div>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-nav text-ink-800">
                Email Address
              </span>
              <input
                autoComplete="email"
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    email: event.target.value,
                  }))
                }
                required
                type="email"
                value={formState.email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-nav text-ink-800">
                Password
              </span>
              <input
                autoComplete="current-password"
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    password: event.target.value,
                  }))
                }
                required
                type="password"
                value={formState.password}
              />
            </label>

            {errorMessage ? (
              <div className="border border-crimson-700/30 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                {errorMessage}
              </div>
            ) : null}

            <button
              className="w-full bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
