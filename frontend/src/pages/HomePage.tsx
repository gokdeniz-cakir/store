import { BookOpen, Compass, Feather, Sparkle } from '@phosphor-icons/react'

const featuredBooks = [
  {
    title: 'Dune',
    author: 'Frank Herbert',
    price: '$125.00',
    coverColor: '#c4a97f',
    icon: BookOpen,
    textClassName: 'text-ink-900',
    borderClassName: 'border-ink-900/20',
    iconClassName: 'text-ink-900/60',
  },
  {
    title: 'Moby Dick',
    author: 'Herman Melville',
    price: '$140.00',
    coverColor: '#2a4552',
    icon: Compass,
    textClassName: 'text-white',
    borderClassName: 'border-white/20',
    iconClassName: 'text-white/60',
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    price: '$95.00',
    coverColor: '#823a3a',
    icon: Sparkle,
    textClassName: 'text-gold-500',
    borderClassName: 'border-gold-500/40',
    iconClassName: 'text-gold-500/80',
  },
] as const

function HomePage() {
  return (
    <main className="min-h-screen bg-parchment-50">
      <section className="mx-auto max-w-content px-8 py-24">
        <div className="mb-16 max-w-3xl border-b border-parchment-200 pb-8">
          <span className="mb-4 block text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
            Aurelia Editions
          </span>
          <h1 className="font-serif text-5xl leading-tight text-ink-900 md:text-6xl">
            Frontend foundations for a literary storefront.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-500">
            Phase 1 establishes the React, routing, Tailwind, and API client baseline.
            The full shared layout from the reference design lands in the next task.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="border border-parchment-200 bg-white p-8 shadow-[0_18px_45px_-35px_rgba(0,0,0,0.35)]">
            <div className="mb-8 flex items-center justify-between gap-6 border-b border-parchment-200 pb-6">
              <div>
                <span className="mb-3 block text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
                  New &amp; Notable
                </span>
                <h2 className="font-serif text-4xl text-ink-900">Book card system</h2>
              </div>
              <a
                className="border border-ink-900 px-5 py-3 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                href="/design-reference.html"
                rel="noreferrer"
                target="_blank"
              >
                View Reference
              </a>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
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
          </section>

          <aside className="border border-parchment-200 bg-parchment-100 p-8">
            <span className="mb-3 block text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
              Scaffold Status
            </span>
            <h2 className="font-serif text-4xl text-ink-900">Ready for shared layout</h2>
            <p className="mt-6 text-base leading-7 text-ink-500">
              The frontend now has the Aurelia color system, font pairing, Tailwind
              utilities, React Router, and a centralized axios instance for backend calls.
            </p>

            <ul className="mt-8 space-y-4 text-sm text-ink-800">
              <li className="flex items-start gap-3">
                <Feather className="mt-0.5 text-lg text-crimson-700" />
                Typed Vite + React scaffold with strict TypeScript settings.
              </li>
              <li className="flex items-start gap-3">
                <Feather className="mt-0.5 text-lg text-crimson-700" />
                Tailwind theme tokens aligned to the reference palette and typography.
              </li>
              <li className="flex items-start gap-3">
                <Feather className="mt-0.5 text-lg text-crimson-700" />
                Axios client ready for JWT attachment and API error propagation.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default HomePage
