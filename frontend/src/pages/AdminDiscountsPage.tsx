import { Percent, SealPercent, Sparkle } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'

import { applyDiscount } from '../services/discountService'
import { getBooks } from '../services/bookService'
import type { Book } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: Book[]
  error: string | null
  isLoading: boolean
}

function AdminDiscountsPage() {
  const [booksState, setBooksState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([])
  const [percentage, setPercentage] = useState('15')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadBooks() {
      try {
        const bookPage = await getBooks({ page: 0, size: 100, sort: 'title,asc' })

        if (!isActive) {
          return
        }

        setBooksState({
          data: bookPage.content,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setBooksState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load books for discount management.'),
          isLoading: false,
        })
      }
    }

    void loadBooks()

    return () => {
      isActive = false
    }
  }, [])

  function toggleBookSelection(bookId: number) {
    setSelectedBookIds((currentIds) =>
      currentIds.includes(bookId)
        ? currentIds.filter((currentId) => currentId !== bookId)
        : [...currentIds, bookId],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedPercentage = Number(percentage)
    if (!Number.isInteger(parsedPercentage) || parsedPercentage < 1 || parsedPercentage > 100) {
      setActionError('Discount percentage must be a whole number between 1 and 100.')
      return
    }

    if (selectedBookIds.length === 0) {
      setActionError('Select at least one book before applying a discount.')
      return
    }

    setIsSubmitting(true)
    setActionError(null)
    setNotice(null)

    try {
      const updatedBooks = await applyDiscount({
        bookIds: selectedBookIds,
        percentage: parsedPercentage,
      })

      setBooksState((currentState) => ({
        ...currentState,
        data: currentState.data.map((book) => {
          const updatedBook = updatedBooks.find((candidate) => candidate.id === book.id)
          return updatedBook ?? book
        }),
      }))
      setNotice(
        `Applied ${parsedPercentage}% discount to ${updatedBooks.length} selected edition${updatedBooks.length === 1 ? '' : 's'}.`,
      )
      setSelectedBookIds([])
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to apply the discount campaign.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Sales Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">Discount management</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Launch discount campaigns against selected editions. Wishlist readers will be
          notified automatically when their saved books go on offer.
        </p>
      </section>

      {actionError ? (
        <div className="mt-8 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
          {actionError}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-8 border border-gold-500/20 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
          {notice}
        </div>
      ) : null}

      <section className="mt-8 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="border border-parchment-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <SealPercent className="text-3xl text-crimson-700" />
            <div>
              <h2 className="font-serif text-3xl text-ink-900">Campaign setup</h2>
              <p className="mt-2 text-sm text-ink-500">
                {selectedBookIds.length} selected edition{selectedBookIds.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                Discount Percentage
              </span>
              <div className="flex items-center border border-parchment-200 bg-parchment-50 px-4">
                <Percent className="mr-3 text-lg text-ink-500" />
                <input
                  className="w-full bg-transparent py-3 text-sm text-ink-900 outline-none"
                  max="100"
                  min="1"
                  onChange={(event) => setPercentage(event.target.value)}
                  step="1"
                  type="number"
                  value={percentage}
                />
              </div>
            </label>

            <button
              className="inline-flex w-full items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
              disabled={isSubmitting}
              type="submit"
            >
              <Sparkle className="text-sm" />
              {isSubmitting ? 'Applying...' : 'Apply Discount'}
            </button>
          </form>
        </article>

        <article className="border border-parchment-200 bg-white p-6">
          {booksState.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="h-24 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
              ))}
            </div>
          ) : null}

          {!booksState.isLoading && booksState.error ? (
            <div className="border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {booksState.error}
            </div>
          ) : null}

          {!booksState.isLoading && !booksState.error ? (
            <div className="space-y-4">
              {booksState.data.map((book) => {
                const selected = selectedBookIds.includes(book.id)

                return (
                  <label
                    className={`grid cursor-pointer gap-4 border p-5 transition-colors md:grid-cols-[28px_minmax(0,1fr)_140px] ${
                      selected
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-parchment-200 bg-parchment-50 hover:border-ink-900'
                    }`}
                    key={book.id}
                  >
                    <input
                      checked={selected}
                      className="mt-1 h-4 w-4 accent-ink-900"
                      onChange={() => toggleBookSelection(book.id)}
                      type="checkbox"
                    />
                    <div>
                      <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                        {book.category.name}
                      </p>
                      <h2 className="mt-3 font-serif text-3xl text-ink-900">{book.title}</h2>
                      <p className="mt-2 text-sm text-ink-500">
                        {book.author} · {book.edition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-ink-900">{formatCurrency(book.price)}</p>
                      {book.originalPrice ? (
                        <p className="mt-2 text-sm text-ink-500 line-through">
                          {formatCurrency(book.originalPrice)}
                        </p>
                      ) : null}
                    </div>
                  </label>
                )
              })}
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default AdminDiscountsPage
