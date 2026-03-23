import { WarningCircle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import StarRating from './StarRating'
import WishlistToggleButton from './WishlistToggleButton'
import type { Book } from '../../types/catalog'
import {
  formatCurrency,
  getCoverPresentation,
  renderCategoryIcon,
  truncateText,
} from '../../utils/catalog'

interface BookCardProps {
  book: Book
}

function BookCard({ book }: BookCardProps) {
  const coverPresentation = getCoverPresentation(book.coverColor)
  const isOutOfStock = book.stockQuantity <= 0

  return (
    <article className="group flex h-full flex-col">
      <Link className="block" to={`/books/${book.id}`}>
        <div
          className="book-shadow book-spine-left relative flex aspect-[2/3] items-center justify-center overflow-hidden px-5 py-6 transition-transform duration-500 group-hover:-translate-y-2"
          style={{ backgroundColor: book.coverColor }}
        >
          <div className={`absolute inset-3 border ${coverPresentation.borderClassName}`} />
          <div className="absolute left-0 top-5 bg-black/15 px-3 py-1 text-[9px] uppercase tracking-[0.28em] text-white/80">
            {book.category.name}
          </div>
          <div className="relative z-10 text-center">
            {renderCategoryIcon(
              book.category.iconName,
              `mx-auto mb-4 text-[30px] ${coverPresentation.iconClassName}`,
            )}
            <h3
              className={`font-serif text-[1.55rem] uppercase leading-tight tracking-[0.2em] ${coverPresentation.textClassName}`}
            >
              {book.title}
            </h3>
            <p
              className={`mt-4 text-xs uppercase tracking-[0.3em] ${coverPresentation.iconClassName}`}
            >
              {book.author}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col border border-t-0 border-parchment-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-eyebrow text-crimson-700">
              {book.edition}
            </p>
            <h4 className="mt-2 font-serif text-[1.65rem] leading-tight text-ink-900 transition-colors group-hover:text-crimson-700">
              {book.title}
            </h4>
            <p className="mt-2 text-sm text-ink-500">{book.author}</p>
            <StarRating
              className="mt-4"
              iconClassName="text-sm"
              reviewCount={book.reviewCount}
              value={book.averageRating}
            />
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <WishlistToggleButton book={book} />
            <span
              className={`inline-flex items-center gap-2 border px-3 py-1 text-[10px] uppercase tracking-nav ${
                isOutOfStock
                  ? 'border-crimson-700/20 bg-crimson-700/5 text-crimson-800'
                  : 'border-parchment-200 bg-parchment-50 text-ink-500'
              }`}
            >
              {isOutOfStock ? <WarningCircle className="text-sm" /> : null}
              {isOutOfStock ? 'Out of Stock' : `${book.stockQuantity} in stock`}
            </span>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-ink-500">
          {truncateText(book.description, 150)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-parchment-200 pt-5 text-sm">
          <div>
            <dt className="text-[10px] uppercase tracking-nav text-ink-500">Publisher</dt>
            <dd className="mt-1 text-ink-900">{book.publisher}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-nav text-ink-500">Language</dt>
            <dd className="mt-1 text-ink-900">{book.language ?? 'Edition Detail'}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-nav text-ink-500">Year</dt>
            <dd className="mt-1 text-ink-900">{book.publicationYear ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-nav text-ink-500">Pages</dt>
            <dd className="mt-1 text-ink-900">{book.pageCount ?? 'N/A'}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between border-t border-parchment-200 pt-5">
          <div className="flex items-end gap-3">
            <span className="font-serif text-2xl text-ink-900">{formatCurrency(book.price)}</span>
            {book.originalPrice ? (
              <span className="pb-0.5 text-sm text-ink-500 line-through">
                {formatCurrency(book.originalPrice)}
              </span>
            ) : null}
          </div>

          <Link
            className="border border-ink-900 px-4 py-2 text-[10px] uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            to={`/books/${book.id}`}
          >
            View Edition
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BookCard
