import { FloppyDisk, Rows, WarningCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { getBooks, updateBook } from '../services/bookService'
import type { Book, BookRequest } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface AsyncState {
  data: Book[]
  error: string | null
  isLoading: boolean
}

function toBookRequest(book: Book, stockQuantity: number): BookRequest {
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    edition: book.edition,
    description: book.description,
    stockQuantity,
    price: book.price,
    originalPrice: book.originalPrice,
    returnPolicy: book.returnPolicy,
    publisher: book.publisher,
    pageCount: book.pageCount,
    language: book.language,
    publicationYear: book.publicationYear,
    coverImageUrl: book.coverImageUrl,
    coverColor: book.coverColor,
    categoryId: book.category.id,
  }
}

function AdminStockPage() {
  const [booksState, setBooksState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [draftQuantities, setDraftQuantities] = useState<Record<number, string>>({})
  const [savingBookId, setSavingBookId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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
        setDraftQuantities(
          Object.fromEntries(bookPage.content.map((book) => [book.id, String(book.stockQuantity)])),
        )
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setBooksState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load stock records.'),
          isLoading: false,
        })
      }
    }

    void loadBooks()

    return () => {
      isActive = false
    }
  }, [])

  async function handleSave(book: Book) {
    const nextQuantity = Number(draftQuantities[book.id] ?? book.stockQuantity)

    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      setActionError('Stock quantity must be a whole number greater than or equal to zero.')
      return
    }

    setSavingBookId(book.id)
    setActionError(null)
    setNotice(null)

    try {
      const updatedBook = await updateBook(book.id, toBookRequest(book, nextQuantity))

      setBooksState((currentState) => ({
        ...currentState,
        data: currentState.data.map((currentBook) =>
          currentBook.id === updatedBook.id ? updatedBook : currentBook,
        ),
      }))
      setDraftQuantities((currentDrafts) => ({
        ...currentDrafts,
        [book.id]: String(updatedBook.stockQuantity),
      }))
      setNotice(`Updated stock for "${updatedBook.title}".`)
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to update stock quantity.'))
    } finally {
      setSavingBookId(null)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Product Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">Stock management</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Adjust live inventory without opening the full book editor. These changes feed
          directly into storefront availability and checkout validation.
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

      <section className="mt-8 border border-parchment-200 bg-white p-6">
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
              const draftValue = draftQuantities[book.id] ?? String(book.stockQuantity)
              const isLowStock = Number(draftValue) <= 2

              return (
                <article
                  className="grid gap-5 border border-parchment-200 bg-parchment-50 p-5 xl:grid-cols-[minmax(0,1fr)_180px_170px]"
                  key={book.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                        {book.category.name}
                      </span>
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-2 border border-crimson-700/20 bg-crimson-700/5 px-3 py-1 text-[10px] uppercase tracking-nav text-crimson-800">
                          <WarningCircle className="text-sm" />
                          Low stock
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 font-serif text-3xl text-ink-900">{book.title}</h2>
                    <p className="mt-2 text-sm text-ink-500">
                      {book.author} · {book.edition}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-800">
                      <span>{formatCurrency(book.price)}</span>
                      <span>ISBN {book.isbn}</span>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                      Stock Quantity
                    </span>
                    <input
                      className="w-full border border-parchment-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                      min="0"
                      onChange={(event) =>
                        setDraftQuantities((currentDrafts) => ({
                          ...currentDrafts,
                          [book.id]: event.target.value,
                        }))
                      }
                      type="number"
                      value={draftValue}
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                      disabled={savingBookId === book.id}
                      onClick={() => handleSave(book)}
                      type="button"
                    >
                      {savingBookId === book.id ? (
                        <Rows className="text-sm" />
                      ) : (
                        <FloppyDisk className="text-sm" />
                      )}
                      {savingBookId === book.id ? 'Saving...' : 'Save Stock'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default AdminStockPage
