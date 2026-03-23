import { ArrowLeft, CheckCircle, ShoppingBagOpen, WarningCircle } from '@phosphor-icons/react'
import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getBook } from '../services/bookService'
import type { Book } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import {
  formatCurrency,
  getCoverPresentation,
  renderCategoryIcon,
  truncateText,
} from '../utils/catalog'

interface DetailState {
  data: Book | null
  error: string | null
  isLoading: boolean
}

function BookDetailSkeleton() {
  return (
    <main className="flex-1 bg-parchment-50 py-16">
      <div className="mx-auto grid max-w-content animate-pulse gap-12 px-8 lg:grid-cols-[460px_minmax(0,1fr)]">
        <div className="aspect-[2/3] bg-parchment-200" />
        <div>
          <div className="h-3 w-24 bg-parchment-200" />
          <div className="mt-6 h-16 w-3/4 bg-parchment-200" />
          <div className="mt-4 h-5 w-1/3 bg-parchment-100" />
          <div className="mt-8 h-10 w-48 bg-parchment-200" />
          <div className="mt-8 space-y-4">
            <div className="h-4 w-full bg-parchment-100" />
            <div className="h-4 w-11/12 bg-parchment-100" />
            <div className="h-4 w-5/6 bg-parchment-100" />
          </div>
        </div>
      </div>
    </main>
  )
}

interface BookDetailPageInnerProps {
  bookId?: string
}

function BookDetailPageInner({ bookId }: BookDetailPageInnerProps) {
  const parsedBookId = Number(bookId)
  const hasValidBookId = Number.isInteger(parsedBookId) && parsedBookId > 0
  const [detailState, setDetailState] = useState<DetailState>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!hasValidBookId) {
      return
    }

    let isActive = true

    async function loadBook() {
      try {
        const book = await getBook(parsedBookId)

        if (!isActive) {
          return
        }

        setDetailState({
          data: book,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setDetailState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load this edition right now.'),
          isLoading: false,
        })
      }
    }

    void loadBook()

    return () => {
      isActive = false
    }
  }, [bookId, hasValidBookId, parsedBookId])

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setNotice('Cart management arrives in Phase 4. This button is ready for that flow.')
  }

  if (detailState.isLoading) {
    return <BookDetailSkeleton />
  }

  if (!hasValidBookId || !detailState.data) {
    return (
      <main className="flex-1 bg-parchment-50 py-20">
        <div className="mx-auto max-w-3xl border border-parchment-200 bg-white px-8 py-16 text-center">
          <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Edition Unavailable
          </p>
          <h1 className="mt-6 font-serif text-4xl text-ink-900">We could not open this book</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
            {hasValidBookId
              ? detailState.error ?? 'The requested edition does not exist in the current catalog.'
              : 'The selected edition could not be identified.'}
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 border border-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            to="/books"
          >
            <ArrowLeft className="text-sm" />
            Return To Catalogue
          </Link>
        </div>
      </main>
    )
  }

  const book = detailState.data
  const coverPresentation = getCoverPresentation(book.coverColor)
  const isOutOfStock = book.stockQuantity <= 0

  return (
    <main className="flex-1 bg-parchment-50">
      <section className="border-b border-parchment-200 bg-white py-8">
        <div className="mx-auto max-w-content px-8">
          <Link
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-nav text-ink-500 transition-colors hover:text-crimson-700"
            to="/books"
          >
            <ArrowLeft className="text-sm" />
            Back To Catalogue
          </Link>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-content gap-12 px-8 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-start">
          <div
            className="book-shadow book-spine-left relative mx-auto flex aspect-[2/3] w-full max-w-[460px] items-center justify-center overflow-hidden px-8 py-10"
            style={{ backgroundColor: book.coverColor }}
          >
            <div className={`absolute inset-5 border ${coverPresentation.borderClassName}`} />
            <div className="absolute inset-10 border border-white/10" />
            <div className="absolute left-0 top-8 bg-black/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80">
              {book.category.name}
            </div>
            <div className="relative z-10 text-center">
              {renderCategoryIcon(
                book.category.iconName,
                `mx-auto mb-6 text-[44px] ${coverPresentation.iconClassName}`,
              )}
              <h1
                className={`font-serif text-[2.4rem] uppercase leading-[1.1] tracking-[0.24em] ${coverPresentation.textClassName}`}
              >
                {book.title}
              </h1>
              <p
                className={`mt-5 text-sm uppercase tracking-[0.35em] ${coverPresentation.iconClassName}`}
              >
                {book.author}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              {book.category.name}
            </span>
            <h2 className="mt-5 font-serif text-5xl leading-[1.05] text-ink-900">
              {book.title}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{book.author}</p>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <span className="font-serif text-4xl text-ink-900">{formatCurrency(book.price)}</span>
              {book.originalPrice ? (
                <span className="pb-1 text-lg text-ink-500 line-through">
                  {formatCurrency(book.originalPrice)}
                </span>
              ) : null}
              <span
                className={`inline-flex items-center gap-2 border px-4 py-2 text-[11px] uppercase tracking-nav ${
                  isOutOfStock
                    ? 'border-crimson-700/20 bg-crimson-700/5 text-crimson-800'
                    : 'border-parchment-200 bg-parchment-100 text-ink-800'
                }`}
              >
                {isOutOfStock ? (
                  <WarningCircle className="text-base" />
                ) : (
                  <CheckCircle className="text-base text-crimson-700" />
                )}
                {isOutOfStock ? 'Out Of Stock' : `${book.stockQuantity} available`}
              </span>
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8 text-ink-500">{book.description}</p>

            <div className="mt-10 flex flex-col gap-4 md:flex-row">
              <button
                className="inline-flex items-center justify-center gap-3 bg-ink-900 px-8 py-4 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                type="button"
              >
                <ShoppingBagOpen className="text-base" />
                {isOutOfStock ? 'Unavailable' : 'Add To Cart'}
              </button>
              <Link
                className="inline-flex items-center justify-center border border-ink-900 px-8 py-4 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                to={`/books?category=${encodeURIComponent(book.category.name)}`}
              >
                Explore {book.category.name}
              </Link>
            </div>

            {notice ? (
              <div className="mt-5 border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
                {notice}
              </div>
            ) : null}

            <div className="mt-12 grid gap-6 border-t border-parchment-200 pt-8 md:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Edition</p>
                <p className="mt-2 text-base text-ink-900">{book.edition}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">ISBN</p>
                <p className="mt-2 text-base text-ink-900">{book.isbn}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Publisher</p>
                <p className="mt-2 text-base text-ink-900">{book.publisher}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Publication Year</p>
                <p className="mt-2 text-base text-ink-900">{book.publicationYear ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Language</p>
                <p className="mt-2 text-base text-ink-900">{book.language ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Page Count</p>
                <p className="mt-2 text-base text-ink-900">{book.pageCount ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-parchment-200 bg-white py-16">
        <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="border border-parchment-200 bg-parchment-50 p-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Collector&apos;s Note
            </span>
            <h3 className="mt-5 font-serif text-3xl text-ink-900">Aurelia editorial framing</h3>
            <p className="mt-5 text-sm leading-8 text-ink-500">
              {truncateText(
                book.description,
                290,
              )} This edition is presented as part of the live catalog seeded from the
              backend migration and rendered in the storefront with the same spine,
              shadow, and serif treatment used across the Aurelia design system.
            </p>
          </article>

          <article className="border border-parchment-200 bg-white p-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Edition Specifications
            </span>
            <ul className="mt-5 space-y-4 text-sm text-ink-800">
              <li className="flex items-start justify-between gap-4 border-b border-parchment-200 pb-4">
                <span className="text-ink-500">Return Policy</span>
                <span className="text-right">{book.returnPolicy ?? 'Standard Aurelia care'}</span>
              </li>
              <li className="flex items-start justify-between gap-4 border-b border-parchment-200 pb-4">
                <span className="text-ink-500">Inventory Status</span>
                <span className="text-right">
                  {isOutOfStock ? 'Awaiting replenishment' : `${book.stockQuantity} copies on hand`}
                </span>
              </li>
              <li className="flex items-start justify-between gap-4 border-b border-parchment-200 pb-4">
                <span className="text-ink-500">Cover Tone</span>
                <span className="text-right">{book.coverColor}</span>
              </li>
              <li className="flex items-start justify-between gap-4">
                <span className="text-ink-500">Category</span>
                <span className="text-right">{book.category.name}</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  )
}

function BookDetailPage() {
  const { bookId } = useParams()

  return <BookDetailPageInner bookId={bookId} key={bookId} />
}

export default BookDetailPage
