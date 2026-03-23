import { ArrowRight, HeartStraightBreak } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import FeedbackPanel from '../components/feedback/FeedbackPanel'
import StarRating from '../components/books/StarRating'
import { useToast } from '../hooks/useToast'
import { useWishlist } from '../hooks/useWishlist'
import { formatCurrency, getCoverPresentation, renderCategoryIcon } from '../utils/catalog'
import { getApiErrorMessage } from '../utils/apiError'

function WishlistPage() {
  const { error, isLoading, removeFromWishlist, wishlistItems } = useWishlist()
  const { showToast } = useToast()
  const [removingBookId, setRemovingBookId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleRemove(bookId: number) {
    setActionError(null)
    setRemovingBookId(bookId)

    try {
      await removeFromWishlist(bookId)
      showToast({
        message: 'The edition has been removed from your saved library.',
        title: 'Wishlist Updated',
        tone: 'success',
      })
    } catch (removeError: unknown) {
      const message = getApiErrorMessage(removeError, 'Unable to update your wishlist.')
      setActionError(message)
      showToast({
        message,
        title: 'Wishlist Error',
        tone: 'error',
      })
    } finally {
      setRemovingBookId(null)
    }
  }

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto max-w-content px-8">
        <div className="mb-10">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Saved Editions
          </span>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink-900">
            Your wishlist library
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500">
            Keep promising editions close at hand, then return when you are ready to
            inspect or purchase them.
          </p>
        </div>

        {actionError ? (
          <div className="mb-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
            {actionError}
          </div>
        ) : null}

        {error && !wishlistItems.length ? (
          <FeedbackPanel
            description={error}
            eyebrow="Saved Editions"
            title="Wishlist unavailable"
            tone="error"
          />
        ) : null}

        {isLoading && !wishlistItems.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-80 animate-pulse border border-parchment-200 bg-white" key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && wishlistItems.length === 0 ? (
          <FeedbackPanel
            actions={
              <Link
                className="inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                to="/books"
              >
                Browse Catalogue
                <ArrowRight className="text-sm" />
              </Link>
            }
            description="Save books from the catalog to build a short list of editions worth revisiting."
            icon={<HeartStraightBreak />}
            title="Your wishlist is empty"
          />
        ) : null}

        {!isLoading && wishlistItems.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {wishlistItems.map((item) => {
              const coverPresentation = getCoverPresentation(item.coverColor)
              const isOutOfStock = item.stockQuantity <= 0

              return (
                <article
                  className="grid gap-6 border border-parchment-200 bg-white p-6 md:grid-cols-[220px_minmax(0,1fr)]"
                  key={item.id}
                >
                  <Link
                    className="book-shadow book-spine-left relative flex aspect-[2/3] items-center justify-center overflow-hidden px-5 py-6"
                    style={{ backgroundColor: item.coverColor }}
                    to={`/books/${item.bookId}`}
                  >
                    <div className={`absolute inset-4 border ${coverPresentation.borderClassName}`} />
                    <div className="absolute left-0 top-5 bg-black/15 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-white/80">
                      {item.category.name}
                    </div>
                    <div className="relative z-10 text-center">
                      {renderCategoryIcon(
                        item.category.iconName,
                        `mx-auto mb-4 text-[30px] ${coverPresentation.iconClassName}`,
                      )}
                      <h2
                        className={`font-serif text-[1.8rem] uppercase leading-tight tracking-[0.2em] ${coverPresentation.textClassName}`}
                      >
                        {item.title}
                      </h2>
                      <p
                        className={`mt-4 text-xs uppercase tracking-[0.3em] ${coverPresentation.iconClassName}`}
                      >
                        {item.author}
                      </p>
                    </div>
                  </Link>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                          {item.edition}
                        </p>
                        <h2 className="mt-3 font-serif text-3xl text-ink-900">{item.title}</h2>
                        <p className="mt-2 text-sm text-ink-500">{item.author}</p>
                        <StarRating
                          className="mt-4"
                          iconClassName="text-sm"
                          reviewCount={item.reviewCount}
                          value={item.averageRating}
                        />
                      </div>

                      <span
                        className={`border px-3 py-1 text-[10px] uppercase tracking-nav ${
                          isOutOfStock
                            ? 'border-crimson-700/20 bg-crimson-700/5 text-crimson-800'
                            : 'border-parchment-200 bg-parchment-50 text-ink-500'
                        }`}
                      >
                        {isOutOfStock ? 'Out Of Stock' : `${item.stockQuantity} in stock`}
                      </span>
                    </div>

                    <div className="mt-auto border-t border-parchment-200 pt-6">
                      <div className="flex items-end gap-3">
                        <span className="font-serif text-3xl text-ink-900">
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice ? (
                          <span className="pb-1 text-sm text-ink-500 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                          to={`/books/${item.bookId}`}
                        >
                          View Edition
                          <ArrowRight className="text-sm" />
                        </Link>
                        <button
                          className="inline-flex items-center justify-center border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={removingBookId === item.bookId}
                          onClick={() => handleRemove(item.bookId)}
                          type="button"
                        >
                          {removingBookId === item.bookId ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default WishlistPage
