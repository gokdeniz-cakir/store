import {
  ArrowLeft,
  CheckCircle,
  ShoppingBagOpen,
  Star,
  WarningCircle,
} from '@phosphor-icons/react'
import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import StarRating from '../components/books/StarRating'
import WishlistToggleButton from '../components/books/WishlistToggleButton'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getBook } from '../services/bookService'
import { createReview, getApprovedReviews } from '../services/reviewService'
import type { Book } from '../types/catalog'
import type { Review } from '../types/review'
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

interface ReviewState {
  data: Review[]
  error: string | null
  isLoading: boolean
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
  const location = useLocation()
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const [detailState, setDetailState] = useState<DetailState>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [reviewState, setReviewState] = useState<ReviewState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [notice, setNotice] = useState<string | null>(null)
  const [reviewFormState, setReviewFormState] = useState({
    rating: 5,
    comment: '',
  })
  const [reviewNotice, setReviewNotice] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

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

  useEffect(() => {
    if (!hasValidBookId) {
      return
    }

    let isActive = true

    async function loadReviews() {
      try {
        const reviews = await getApprovedReviews(parsedBookId)

        if (!isActive) {
          return
        }

        setReviewState({
          data: reviews,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setReviewState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load reader reviews right now.'),
          isLoading: false,
        })
      }
    }

    setReviewState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    void loadReviews()

    return () => {
      isActive = false
    }
  }, [bookId, hasValidBookId, parsedBookId])

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!detailState.data) {
      return
    }

    addItem(detailState.data)
    setNotice('Added to cart. Guest selections persist locally until checkout.')
    showToast({
      message: `"${detailState.data.title}" is now in your cart.`,
      title: 'Cart Updated',
      tone: 'success',
    })
  }

  async function handleReviewSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (!detailState.data) {
      return
    }

    setReviewError(null)
    setReviewNotice(null)
    setIsSubmittingReview(true)

    try {
      await createReview(detailState.data.id, {
        rating: reviewFormState.rating,
        comment: reviewFormState.comment.trim() || undefined,
      })

      setReviewFormState({
        rating: 5,
        comment: '',
      })
      setReviewNotice(
        'Your review has been submitted and is now awaiting editorial approval.',
      )
      showToast({
        message: 'Your review is now awaiting editorial moderation.',
        title: 'Review Submitted',
        tone: 'success',
      })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to submit your review right now.')
      setReviewError(message)
      showToast({
        message,
        title: 'Review Error',
        tone: 'error',
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (detailState.isLoading) {
    return <BookDetailSkeleton />
  }

  if (!hasValidBookId || !detailState.data) {
    return (
      <main className="flex-1 bg-parchment-50 py-20">
        <div className="mx-auto max-w-3xl px-8">
          <FeedbackPanel
            actions={
              <Link
                className="inline-flex items-center gap-2 border border-ink-900 px-6 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                to="/books"
              >
                <ArrowLeft className="text-sm" />
                Return To Catalogue
              </Link>
            }
            description={
              hasValidBookId
                ? detailState.error ?? 'The requested edition does not exist in the current catalog.'
                : 'The selected edition could not be identified.'
            }
            eyebrow="Edition Unavailable"
            title="We could not open this book"
            tone="error"
          />
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
            <StarRating
              className="mt-5"
              iconClassName="text-lg"
              reviewCount={book.reviewCount}
              value={book.averageRating}
            />

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
              <WishlistToggleButton book={book} variant="full" />
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

      <section className="bg-parchment-50 py-16">
        <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="border border-parchment-200 bg-white p-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Reader Notes
            </span>
            <h3 className="mt-5 font-serif text-3xl text-ink-900">Review this edition</h3>
            <p className="mt-4 text-sm leading-7 text-ink-500">
              Ratings are published after moderation by the Aurelia editorial team.
            </p>

            <div className="mt-8 border border-parchment-200 bg-parchment-50 p-5">
              <p className="text-[10px] uppercase tracking-nav text-ink-500">Current Reception</p>
              <StarRating
                className="mt-4"
                iconClassName="text-lg"
                reviewCount={book.reviewCount}
                value={book.averageRating}
              />
            </div>

            {isAuthenticated && user?.role === 'CUSTOMER' ? (
              <form className="mt-8 space-y-6">
                <div>
                  <span className="mb-3 block text-[10px] uppercase tracking-nav text-ink-500">
                    Your Rating
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const ratingValue = index + 1
                      const isSelected = reviewFormState.rating >= ratingValue

                      return (
                        <button
                          className={`border px-3 py-3 transition-colors ${
                            isSelected
                              ? 'border-gold-500 bg-gold-500/10 text-gold-600'
                              : 'border-parchment-200 bg-white text-ink-500 hover:border-ink-900'
                          }`}
                          key={ratingValue}
                          onClick={() =>
                            setReviewFormState((currentState) => ({
                              ...currentState,
                              rating: ratingValue,
                            }))
                          }
                          type="button"
                        >
                          <Star className="text-xl" weight={isSelected ? 'fill' : 'regular'} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-3 block text-[10px] uppercase tracking-nav text-ink-500">
                    Commentary
                  </span>
                  <textarea
                    className="min-h-44 w-full resize-none border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm leading-7 text-ink-900 outline-none transition-colors focus:border-ink-900"
                    maxLength={5000}
                    onChange={(event) =>
                      setReviewFormState((currentState) => ({
                        ...currentState,
                        comment: event.target.value,
                      }))
                    }
                    placeholder="Describe the edition, production quality, translation, or reading experience."
                    value={reviewFormState.comment}
                  />
                </label>

                {reviewError ? (
                  <div className="border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                    {reviewError}
                  </div>
                ) : null}

                {reviewNotice ? (
                  <div className="border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
                    {reviewNotice}
                  </div>
                ) : null}

                <button
                  className="bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                  disabled={isSubmittingReview}
                  onClick={handleReviewSubmit}
                  type="button"
                >
                  {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="mt-8 border border-parchment-200 bg-parchment-50 p-5">
                <p className="text-sm leading-7 text-ink-500">
                  {isAuthenticated
                    ? 'Only customer accounts can leave reviews for catalog editions.'
                    : 'Sign in with a customer account to submit a review for this edition.'}
                </p>
                {!isAuthenticated ? (
                  <Link
                    className="mt-5 inline-flex items-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                    state={{ from: `${location.pathname}${location.search}${location.hash}` }}
                    to="/login"
                  >
                    Sign In To Review
                  </Link>
                ) : null}
              </div>
            )}
          </article>

          <article className="border border-parchment-200 bg-white p-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Approved Reviews
            </span>
            <h3 className="mt-5 font-serif text-3xl text-ink-900">From Aurelia readers</h3>
            <p className="mt-4 text-sm leading-7 text-ink-500">
              Published reviews are visible after moderation and contribute to the live
              popularity ranking in the catalog.
            </p>

            {reviewState.isLoading ? (
              <div className="mt-8 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="border border-parchment-200 bg-parchment-50 p-5" key={index}>
                    <div className="h-4 w-40 animate-pulse bg-parchment-200" />
                    <div className="mt-4 h-3 w-full animate-pulse bg-parchment-100" />
                    <div className="mt-3 h-3 w-10/12 animate-pulse bg-parchment-100" />
                  </div>
                ))}
              </div>
            ) : null}

            {!reviewState.isLoading && reviewState.error ? (
              <div className="mt-8 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                {reviewState.error}
              </div>
            ) : null}

            {!reviewState.isLoading &&
            !reviewState.error &&
            reviewState.data.length === 0 ? (
              <div className="mt-8 border border-parchment-200 bg-parchment-50 px-6 py-10 text-center">
                <p className="font-serif text-3xl text-ink-900">No approved reviews yet</p>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
                  This edition is still waiting for the first moderated reader note.
                </p>
              </div>
            ) : null}

            {!reviewState.isLoading && reviewState.data.length > 0 ? (
              <div className="mt-8 space-y-5">
                {reviewState.data.map((review) => (
                  <article
                    className="border border-parchment-200 bg-parchment-50 p-5"
                    key={review.id}
                  >
                    <div className="flex flex-col gap-3 border-b border-parchment-200 pb-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-serif text-2xl text-ink-900">
                          {review.customerName ?? 'Aurelia reader'}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-nav text-ink-500">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                      <StarRating
                        iconClassName="text-base"
                        showText={false}
                        value={review.rating}
                      />
                    </div>

                    <p className="mt-5 text-sm leading-7 text-ink-800">
                      {review.comment?.trim() || 'This reader left a star rating without a written note.'}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
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
