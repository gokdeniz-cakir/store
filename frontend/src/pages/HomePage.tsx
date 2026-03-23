import {
  Bank,
  Check,
  CheckCircle,
  Eye,
  FlowerLotus,
  GlobeHemisphereWest,
  Leaf,
  Mountains,
  MoonStars,
  Package,
  Planet,
  SealCheck,
  Sparkle,
  StarFour,
  WarningCircle,
  Waves,
} from '@phosphor-icons/react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getHealthStatus } from '../services/healthService'
import type { HealthResponse } from '../types/health'

const featuredBooks = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    price: '$125.00',
    coverColor: '#c4a97f',
    icon: Mountains,
    textClassName: 'text-ink-900',
    borderClassName: 'border-ink-900/20',
    iconClassName: 'text-ink-900/60',
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    price: '$140.00',
    coverColor: '#2a4552',
    icon: Waves,
    textClassName: 'text-white',
    borderClassName: 'border-white/20',
    iconClassName: 'text-white/60',
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    price: '$95.00',
    coverColor: '#823a3a',
    icon: MoonStars,
    textClassName: 'text-gold-500',
    borderClassName: 'border-gold-500/40',
    iconClassName: 'text-gold-500/80',
  },
  {
    title: 'Pride & Prejudice',
    author: 'Jane Austen',
    price: '$85.00',
    coverColor: '#d9d1c7',
    icon: FlowerLotus,
    textClassName: 'text-ink-800',
    borderClassName: 'border-ink-900/10',
    iconClassName: 'text-ink-800/60',
  },
  {
    title: '1984',
    author: 'George Orwell',
    price: '$110.00',
    coverColor: '#222222',
    icon: Eye,
    textClassName: 'text-white',
    borderClassName: 'border-[#ff4a4a]/40',
    iconClassName: 'text-[#ff4a4a]',
  },
] as const

const categoryCards = [
  {
    title: 'Science Fiction & Fantasy',
    description: 'Otherworldly realms in spectacular bindings.',
    href: '/books?category=Sci-Fi%20%26%20Fantasy',
    icon: Planet,
    backgroundClassName: 'bg-[#2a3036]',
  },
  {
    title: 'History & Antiquity',
    description: 'The chronicles of civilization, preserved.',
    href: '/books?category=History%20%26%20Antiquity',
    icon: Bank,
    backgroundClassName: 'bg-[#4a2e2e]',
  },
  {
    title: 'Classic Fiction',
    description: 'Timeless stories in definitive editions.',
    href: '/books?category=Classic%20Literature',
    icon: Leaf,
    backgroundClassName: 'bg-[#2d4234]',
  },
  {
    title: 'Mystery & Crime',
    description: 'Thrilling tales bound with intrigue.',
    href: '/books?category=Mystery%20%26%20Crime',
    icon: Sparkle,
    backgroundClassName: 'bg-[#232b38]',
  },
] as const

const atelierHighlights = [
  'Bound in blocked cloth',
  'Set in Caslon with 288 pages',
  'Frontispiece and 10 integrated woodcuts',
] as const

const serviceHighlights = [
  {
    title: 'Exquisite Packaging',
    description: 'Every order is carefully wrapped in bespoke protective packaging.',
    icon: Package,
  },
  {
    title: 'Worldwide Delivery',
    description: 'Secure, trackable shipping to bibliophiles across the globe.',
    icon: GlobeHemisphereWest,
  },
  {
    title: 'The Aurelia Guarantee',
    description: 'Uncompromising quality in typography, illustration, and binding.',
    icon: SealCheck,
  },
] as const

interface HealthState {
  data: HealthResponse | null
  error: string | null
  isLoading: boolean
}

function HomePage() {
  const [healthState, setHealthState] = useState<HealthState>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    async function loadHealthStatus() {
      try {
        const data = await getHealthStatus()

        if (!isActive) {
          return
        }

        setHealthState({
          data,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        const message = axios.isAxiosError(error)
          ? error.message
          : 'Unable to reach backend health endpoint.'

        setHealthState({
          data: null,
          error: message,
          isLoading: false,
        })
      }
    }

    void loadHealthStatus()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="flex-1">
      <section
        className="relative flex min-h-[75vh] items-center overflow-hidden bg-[#141d26] scroll-mt-40"
        id="hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.18),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_55%)] opacity-90" />

        <div className="relative z-10 mx-auto grid w-full max-w-content gap-16 px-8 py-20 lg:grid-cols-2 lg:items-center lg:px-12">
          <div className="text-white lg:pr-12">
            <span className="mb-6 inline-block border border-gold-500/50 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-500">
              Masterpiece Edition
            </span>
            <h1 className="font-serif text-5xl leading-[1.1] text-white md:text-7xl">
              The Divine
              <br />
              <i className="font-light text-slate-300">Comedy</i>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-8 text-slate-300">
              Dante Alighieri&apos;s monumental epic, presented in an exquisite
              quarter-bound leather edition with new engravings and a silk-bound
              slipcase.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                className="border border-white bg-white px-8 py-4 text-xs font-semibold uppercase tracking-announcement text-ink-900 transition-all duration-300 hover:border-gold-500 hover:bg-gold-500 hover:text-white"
                to="/books?category=Classic%20Literature"
              >
                Explore Edition
              </Link>
              <span className="font-serif text-lg italic text-slate-400">$295.00</span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="book-shadow book-spine-left relative flex aspect-[2/3] w-full max-w-[340px] -rotate-2 flex-col items-center justify-center border border-white/10 bg-[#0f141a] p-8 text-center transition-all duration-700 ease-out hover:rotate-0 hover:scale-105">
              <div className="absolute inset-4 border border-gold-500/30" />
              <div className="absolute inset-[20px] border border-gold-500/10" />
              <div className="relative z-10 flex flex-col items-center">
                <StarFour className="mb-6 text-2xl text-gold-500" />
                <h2 className="font-serif text-3xl uppercase tracking-[0.3em] text-white">
                  The
                  <br />
                  Divine
                  <br />
                  Comedy
                </h2>
                <p className="mt-4 font-serif text-sm italic text-gold-500/80">
                  Dante Alighieri
                </p>
                <div className="my-8 h-px w-12 bg-gold-500/50" />
                <Sparkle className="text-3xl text-gold-500/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-40 py-24" id="collections">
        <div className="mx-auto max-w-content px-8">
          <div className="mb-16 flex flex-col gap-6 border-b border-parchment-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-4xl text-ink-900">Curated Libraries</h2>
              <p className="mt-2 text-ink-500">
                Explore our meticulously crafted genres and thematic collections.
              </p>
            </div>
            <a
              className="w-fit border-b border-ink-900 pb-1 text-xs font-semibold uppercase tracking-nav text-ink-900 hover:border-crimson-700 hover:text-crimson-700"
              href="/design-reference.html"
              rel="noreferrer"
              target="_blank"
            >
              View Design Reference
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((category) => {
              const Icon = category.icon

              return (
                <Link
                  className={`group relative block aspect-[4/5] overflow-hidden ${category.backgroundClassName}`}
                  key={category.title}
                  to={category.href}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <Icon className="mb-4 text-3xl text-slate-300 transition-transform duration-500 group-hover:-translate-y-2" />
                    <h3 className="font-serif text-2xl">{category.title}</h3>
                    <p className="mt-2 translate-y-2 text-sm font-light text-slate-300 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {category.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-40 border-y border-parchment-200 bg-white py-24"
        id="new-releases"
      >
        <div className="mx-auto max-w-content px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 block text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
              Just Arrived
            </span>
            <h2 className="font-serif text-4xl text-ink-900">New &amp; Notable Editions</h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {featuredBooks.map((book) => {
              const Icon = book.icon

              return (
                <article className="group cursor-pointer" key={book.title}>
                  <div
                    className="book-shadow book-spine-left relative mb-6 flex aspect-[2/3] items-center justify-center p-4 transition-transform duration-500 group-hover:-translate-y-2"
                    style={{ backgroundColor: book.coverColor }}
                  >
                    <div className={`absolute inset-3 border ${book.borderClassName}`} />
                    <div className="relative z-10 text-center">
                      <Icon className={`mx-auto mb-3 text-2xl ${book.iconClassName}`} />
                      <h3
                        className={`font-serif text-xl uppercase tracking-wide ${book.textClassName}`}
                      >
                        {book.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-serif text-lg text-ink-900 transition-colors group-hover:text-crimson-700">
                      {book.title}
                    </h4>
                    <p className="mt-1 text-sm text-ink-500">{book.author}</p>
                    <p className="mt-2 text-sm font-medium text-ink-900">{book.price}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              className="inline-block border border-ink-900 px-10 py-4 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              to="/books"
            >
              Shop All Books
            </Link>
          </div>
        </div>
      </section>

      <section className="scroll-mt-40 py-24" id="reading-room">
        <div className="mx-auto max-w-content px-8">
          <div className="grid overflow-hidden border border-parchment-200 bg-parchment-100 lg:grid-cols-2">
            <div className="relative flex min-h-[500px] items-center justify-center bg-[#1c2920] p-16">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_50%)] bg-[length:16px_16px] opacity-30" />
              <div className="relative z-10 flex">
                <div className="book-shadow book-spine-left relative z-0 aspect-[2/3] w-[200px] translate-x-10 -rotate-12 border border-white/10 bg-[#2d4234]">
                  <div className="absolute inset-2 border border-gold-500/20" />
                </div>
                <div className="book-shadow book-spine-left relative z-10 flex aspect-[2/3] w-[240px] flex-col items-center justify-center border border-white/10 bg-[#1a261e] p-6 text-center">
                  <div className="absolute inset-3 border border-gold-500/40" />
                  <Leaf className="mb-4 text-3xl text-gold-500" />
                  <h3 className="font-serif text-xl uppercase tracking-[0.3em] text-white">
                    Walden
                  </h3>
                  <div className="mt-4 h-px w-8 bg-gold-500/50" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-16 lg:p-24" id="editors-choice">
              <div className="mb-6 flex items-center gap-2">
                <StarFour className="text-sm text-gold-500" />
                <span className="text-[10px] font-semibold uppercase tracking-announcement text-ink-900">
                  Editor&apos;s Choice
                </span>
              </div>
              <h2 className="font-serif text-4xl leading-tight text-ink-900 lg:text-5xl">
                Walden &amp;
                <br />
                Civil Disobedience
              </h2>
              <p className="mt-6 text-lg font-light leading-8 text-ink-500">
                Henry David Thoreau&apos;s reflections on simple living, beautifully
                paired with his essay on individual resistance and finished in tactile
                green cloth with gold blocking.
              </p>

              <ul className="mt-8 space-y-3 text-sm text-ink-800">
                {atelierHighlights.map((highlight) => (
                  <li className="flex items-center gap-3" key={highlight}>
                    <Check className="text-lg text-crimson-700" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <Link
                className="mt-10 inline-block w-fit bg-ink-900 px-8 py-4 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                to="/books?category=Classic%20Literature"
              >
                View Details - $65.00
              </Link>

              <div className="mt-10 border border-parchment-200 bg-white p-6">
                <span className="block text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
                  Backend Health
                </span>
                <div className="mt-4 min-h-24">
                  {healthState.isLoading ? (
                    <p className="text-sm text-ink-500">Checking API connectivity...</p>
                  ) : null}

                  {!healthState.isLoading && healthState.data ? (
                    <div className="space-y-3 text-sm text-ink-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-lg text-crimson-700" />
                        <span className="font-medium">
                          {healthState.data.application} is {healthState.data.status}.
                        </span>
                      </div>
                      <p className="text-ink-500">
                        Profiles: {healthState.data.profiles.join(', ') || 'default'}
                      </p>
                      <p className="text-ink-500">
                        Updated {new Date(healthState.data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : null}

                  {!healthState.isLoading && healthState.error ? (
                    <div className="space-y-3 text-sm text-ink-800">
                      <div className="flex items-center gap-3">
                        <WarningCircle className="text-lg text-crimson-700" />
                        <span className="font-medium">Backend health check unavailable.</span>
                      </div>
                      <p className="text-ink-500">{healthState.error}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-mt-40 border-t border-parchment-200 bg-parchment-50 py-16" id="atelier">
        <div className="mx-auto grid max-w-content gap-12 divide-parchment-200 px-8 text-center md:grid-cols-3 md:divide-x">
          {serviceHighlights.map((highlight) => {
            const Icon = highlight.icon

            return (
              <article className="px-4" key={highlight.title}>
                <Icon className="mx-auto mb-4 text-4xl text-ink-500" />
                <h2 className="font-serif text-xl text-ink-900">{highlight.title}</h2>
                <p className="mt-2 text-sm font-light leading-7 text-ink-500">
                  {highlight.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default HomePage
