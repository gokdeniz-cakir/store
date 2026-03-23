import {
  ArrowClockwise,
  FloppyDisk,
  NotePencil,
  PaintBrushBroad,
  Plus,
  Trash,
  X,
} from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'

import { createBook, deleteBook, getBooks, updateBook } from '../services/bookService'
import { getCategories } from '../services/categoryService'
import type { Book, BookRequest, CatalogCategory } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

interface BookFormState {
  title: string
  author: string
  isbn: string
  edition: string
  description: string
  stockQuantity: string
  price: string
  originalPrice: string
  returnPolicy: string
  publisher: string
  pageCount: string
  language: string
  publicationYear: string
  coverImageUrl: string
  coverColor: string
  categoryId: string
}

interface AsyncState<T> {
  data: T
  error: string | null
  isLoading: boolean
}

const emptyBookFormState: BookFormState = {
  title: '',
  author: '',
  isbn: '',
  edition: '',
  description: '',
  stockQuantity: '0',
  price: '',
  originalPrice: '',
  returnPolicy: '',
  publisher: '',
  pageCount: '',
  language: '',
  publicationYear: '',
  coverImageUrl: '',
  coverColor: '#7a2222',
  categoryId: '',
}

function toBookFormState(book: Book): BookFormState {
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    edition: book.edition,
    description: book.description ?? '',
    stockQuantity: String(book.stockQuantity),
    price: String(book.price),
    originalPrice: book.originalPrice ? String(book.originalPrice) : '',
    returnPolicy: book.returnPolicy ?? '',
    publisher: book.publisher,
    pageCount: book.pageCount ? String(book.pageCount) : '',
    language: book.language ?? '',
    publicationYear: book.publicationYear ? String(book.publicationYear) : '',
    coverImageUrl: book.coverImageUrl ?? '',
    coverColor: book.coverColor,
    categoryId: String(book.category.id),
  }
}

function toBookRequest(formState: BookFormState): BookRequest {
  return {
    title: formState.title.trim(),
    author: formState.author.trim(),
    isbn: formState.isbn.trim(),
    edition: formState.edition.trim(),
    description: formState.description.trim() || null,
    stockQuantity: Number(formState.stockQuantity),
    price: Number(formState.price),
    originalPrice: formState.originalPrice ? Number(formState.originalPrice) : null,
    returnPolicy: formState.returnPolicy.trim() || null,
    publisher: formState.publisher.trim(),
    pageCount: formState.pageCount ? Number(formState.pageCount) : null,
    language: formState.language.trim() || null,
    publicationYear: formState.publicationYear ? Number(formState.publicationYear) : null,
    coverImageUrl: formState.coverImageUrl.trim() || null,
    coverColor: formState.coverColor,
    categoryId: Number(formState.categoryId),
  }
}

function AdminBooksPage() {
  const [booksState, setBooksState] = useState<AsyncState<Book[]>>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [categoriesState, setCategoriesState] = useState<AsyncState<CatalogCategory[]>>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [formState, setFormState] = useState<BookFormState>(emptyBookFormState)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadPageData() {
      try {
        const [bookPage, categories] = await Promise.all([
          getBooks({ page: 0, size: 100, sort: 'createdAt,desc' }),
          getCategories(),
        ])

        if (!isActive) {
          return
        }

        setBooksState({
          data: bookPage.content,
          error: null,
          isLoading: false,
        })
        setCategoriesState({
          data: categories,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        const message = getApiErrorMessage(error, 'Unable to load admin catalog data.')
        setBooksState({
          data: [],
          error: message,
          isLoading: false,
        })
        setCategoriesState({
          data: [],
          error: message,
          isLoading: false,
        })
      }
    }

    void loadPageData()

    return () => {
      isActive = false
    }
  }, [])

  function resetForm() {
    setSelectedBookId(null)
    setFormState(emptyBookFormState)
    setFormError(null)
    setNotice(null)
  }

  function handleEdit(book: Book) {
    setSelectedBookId(book.id)
    setFormState(toBookFormState(book))
    setFormError(null)
    setNotice(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      const payload = toBookRequest(formState)
      const savedBook = selectedBookId
        ? await updateBook(selectedBookId, payload)
        : await createBook(payload)

      setBooksState((currentState) => {
        const nextBooks = selectedBookId
          ? currentState.data.map((book) => (book.id === savedBook.id ? savedBook : book))
          : [savedBook, ...currentState.data]

        return {
          ...currentState,
          data: nextBooks,
        }
      })
      setNotice(selectedBookId ? 'Book updated successfully.' : 'Book created successfully.')
      setSelectedBookId(savedBook.id)
      setFormState(toBookFormState(savedBook))
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, 'Unable to save this book.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(bookId: number) {
    setDeletingBookId(bookId)
    setFormError(null)
    setNotice(null)

    try {
      await deleteBook(bookId)
      setBooksState((currentState) => ({
        ...currentState,
        data: currentState.data.filter((book) => book.id !== bookId),
      }))

      if (selectedBookId === bookId) {
        resetForm()
      }

      setNotice('Book deleted successfully.')
    } catch (error: unknown) {
      setFormError(getApiErrorMessage(error, 'Unable to delete this book.'))
    } finally {
      setDeletingBookId(null)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Product Manager
            </span>
            <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">
              Book management
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
              Maintain every edition field used by the storefront, including cover
              color, pricing, stock, and category placement.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            onClick={resetForm}
            type="button"
          >
            <Plus className="text-sm" />
            New Book
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_430px]">
        <article className="border border-parchment-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-parchment-200 pb-4">
            <div>
              <h2 className="font-serif text-3xl text-ink-900">Live catalogue</h2>
              <p className="mt-2 text-sm text-ink-500">
                {booksState.data.length} editions currently available in the admin view.
              </p>
            </div>
            <ArrowClockwise className="text-2xl text-ink-500" />
          </div>

          {booksState.isLoading || categoriesState.isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-28 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
              ))}
            </div>
          ) : null}

          {booksState.error ? (
            <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {booksState.error}
            </div>
          ) : null}

          {!booksState.isLoading && !booksState.error ? (
            <div className="mt-6 space-y-4">
              {booksState.data.map((book) => (
                <article
                  className="grid gap-4 border border-parchment-200 bg-parchment-50 p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  key={book.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                        {book.category.name}
                      </span>
                      <span className="border border-parchment-200 bg-white px-3 py-1 text-[10px] uppercase tracking-nav text-ink-500">
                        {book.stockQuantity} in stock
                      </span>
                    </div>
                    <h3 className="mt-3 font-serif text-3xl text-ink-900">{book.title}</h3>
                    <p className="mt-2 text-sm text-ink-500">
                      {book.author} · {book.edition}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-800">
                      <span>{formatCurrency(book.price)}</span>
                      <span>ISBN {book.isbn}</span>
                      <span>{book.coverColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-3">
                    <button
                      className="inline-flex items-center gap-2 border border-ink-900 px-4 py-2 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                      onClick={() => handleEdit(book)}
                      type="button"
                    >
                      <NotePencil className="text-sm" />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 border border-crimson-700 px-4 py-2 text-xs uppercase tracking-nav text-crimson-700 transition-colors hover:bg-crimson-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingBookId === book.id}
                      onClick={() => handleDelete(book.id)}
                      type="button"
                    >
                      <Trash className="text-sm" />
                      {deletingBookId === book.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </article>

        <article className="border border-parchment-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-parchment-200 pb-4">
            <div>
              <h2 className="font-serif text-3xl text-ink-900">
                {selectedBookId ? 'Edit edition' : 'Add edition'}
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                {selectedBookId
                  ? 'Update every storefront-visible field before saving.'
                  : 'Create a new edition and publish it directly into the catalog.'}
              </p>
            </div>
            {selectedBookId ? (
              <button
                className="inline-flex h-10 w-10 items-center justify-center border border-parchment-200 text-ink-500 transition-colors hover:border-ink-900 hover:text-ink-900"
                onClick={resetForm}
                type="button"
              >
                <X className="text-lg" />
              </button>
            ) : null}
          </div>

          {formError ? (
            <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {formError}
            </div>
          ) : null}

          {notice ? (
            <div className="mt-6 border border-gold-500/20 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
              {notice}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Title
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      title: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.title}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Author
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      author: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.author}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  ISBN-13
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  maxLength={13}
                  minLength={13}
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      isbn: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.isbn}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Edition
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      edition: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.edition}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Publisher
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      publisher: event.target.value,
                    }))
                  }
                  required
                  type="text"
                  value={formState.publisher}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Category
                </span>
                <select
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      categoryId: event.target.value,
                    }))
                  }
                  required
                  value={formState.categoryId}
                >
                  <option value="">Select a category</option>
                  {categoriesState.data.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Price
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  min="0.01"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      price: event.target.value,
                    }))
                  }
                  required
                  step="0.01"
                  type="number"
                  value={formState.price}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Original Price
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  min="0.01"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      originalPrice: event.target.value,
                    }))
                  }
                  step="0.01"
                  type="number"
                  value={formState.originalPrice}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Stock Quantity
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  min="0"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      stockQuantity: event.target.value,
                    }))
                  }
                  required
                  type="number"
                  value={formState.stockQuantity}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Page Count
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  min="1"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      pageCount: event.target.value,
                    }))
                  }
                  type="number"
                  value={formState.pageCount}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Language
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      language: event.target.value,
                    }))
                  }
                  type="text"
                  value={formState.language}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Publication Year
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      publicationYear: event.target.value,
                    }))
                  }
                  type="number"
                  value={formState.publicationYear}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Return Policy
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      returnPolicy: event.target.value,
                    }))
                  }
                  type="text"
                  value={formState.returnPolicy}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Cover Image URL
                </span>
                <input
                  className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      coverImageUrl: event.target.value,
                    }))
                  }
                  type="url"
                  value={formState.coverImageUrl}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Description
                </span>
                <textarea
                  className="min-h-36 w-full resize-none border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm leading-7 text-ink-900 outline-none transition-colors focus:border-ink-900"
                  onChange={(event) =>
                    setFormState((currentState) => ({
                      ...currentState,
                      description: event.target.value,
                    }))
                  }
                  value={formState.description}
                />
              </label>

              <div className="md:col-span-2">
                <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                  Cover Color
                </span>
                <div className="flex flex-wrap items-center gap-4 border border-parchment-200 bg-parchment-50 p-4">
                  <label className="inline-flex items-center gap-3">
                    <input
                      className="h-12 w-20 border-0 bg-transparent p-0"
                      onChange={(event) =>
                        setFormState((currentState) => ({
                          ...currentState,
                          coverColor: event.target.value,
                        }))
                      }
                      type="color"
                      value={formState.coverColor}
                    />
                    <span className="text-sm text-ink-500">{formState.coverColor}</span>
                  </label>
                  <div
                    className="flex flex-1 items-center justify-center border border-parchment-200 px-4 py-5 text-sm uppercase tracking-nav text-white"
                    style={{ backgroundColor: formState.coverColor }}
                  >
                    <PaintBrushBroad className="mr-3 text-base" />
                    Cover Preview
                  </div>
                </div>
              </div>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
              disabled={isSubmitting}
              type="submit"
            >
              <FloppyDisk className="text-sm" />
              {isSubmitting
                ? 'Saving...'
                : selectedBookId
                  ? 'Update Book'
                  : 'Create Book'}
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}

export default AdminBooksPage
