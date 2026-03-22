import {
  ArrowRight,
  BookOpenText,
  Buildings,
  IdentificationCard,
  MapPinLine,
} from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

const collectionPromises = [
  'Customer accounts register only as CUSTOMER roles',
  'Your password is stored securely with BCrypt hashing',
  'You can continue directly into the storefront after registration',
] as const

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, register, user } = useAuth()

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    taxId: '',
    homeAddress: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated && user) {
    return <Navigate replace to="/account" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await register({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        taxId: formState.taxId || undefined,
        homeAddress: formState.homeAddress || undefined,
      })

      navigate('/account', { replace: true })
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to create your account.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-content gap-12 px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="border border-parchment-200 bg-parchment-100 p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Customer Registration
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink-900">
            Establish your
            <br />
            reading profile
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-ink-500">
            Create a customer account to preserve your details and move through the
            Aurelia storefront with a persistent identity.
          </p>

          <div className="mt-12 space-y-5">
            {collectionPromises.map((promise) => (
              <div
                className="flex items-start gap-3 border-t border-parchment-200 pt-5 text-sm text-ink-800"
                key={promise}
              >
                <BookOpenText className="mt-0.5 text-lg text-crimson-700" />
                <span>{promise}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 border border-parchment-200 bg-white p-6">
            <p className="text-sm leading-7 text-ink-500">
              Already registered? Sign in with your existing email and password.
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              to="/login"
            >
              Sign In Instead
              <ArrowRight className="text-sm" />
            </Link>
          </div>
        </section>

        <section className="bg-[#14110e] px-8 py-10 text-white md:px-12 md:py-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-[11px] uppercase tracking-nav text-slate-300">
                  Full Name
                </span>
                <div className="flex items-center border border-white/15 bg-white/5 px-4">
                  <Buildings className="mr-3 text-lg text-gold-500" />
                  <input
                    autoComplete="name"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
                    onChange={(event) =>
                      setFormState((currentState) => ({
                        ...currentState,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    required
                    type="text"
                    value={formState.name}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-nav text-slate-300">
                  Email Address
                </span>
                <input
                  autoComplete="email"
                  className="w-full border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-gold-500"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      email: event.target.value,
                    }))
                  }
                  placeholder="reader@aurelia.com"
                  required
                  type="email"
                  value={formState.email}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-nav text-slate-300">
                  Password
                </span>
                <input
                  autoComplete="new-password"
                  className="w-full border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-gold-500"
                  minLength={8}
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      password: event.target.value,
                    }))
                  }
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={formState.password}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-nav text-slate-300">
                  <IdentificationCard className="text-sm text-gold-500" />
                  Tax ID
                </span>
                <input
                  className="w-full border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-gold-500"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      taxId: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  type="text"
                  value={formState.taxId}
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-nav text-slate-300">
                  <MapPinLine className="text-sm text-gold-500" />
                  Home Address
                </span>
                <textarea
                  className="min-h-32 w-full resize-none border border-white/15 bg-white/5 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-gold-500"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      homeAddress: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  value={formState.homeAddress}
                />
              </label>
            </div>

            {errorMessage ? (
              <div className="border border-crimson-700/40 bg-crimson-700/10 px-4 py-3 text-sm text-[#ffcbc7]">
                {errorMessage}
              </div>
            ) : null}

            <button
              className="w-full bg-gold-500 px-6 py-4 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:bg-[#93815d]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Customer Account'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
