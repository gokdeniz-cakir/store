import {
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
  FunnelSimpleX,
  MagnifyingGlass,
  SlidersHorizontal,
} from '@phosphor-icons/react'
import { useEffect, useState, useTransition, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import BookCard from '../components/books/BookCard'
import FeedbackPanel from '../components/feedback/FeedbackPanel'
import { getBooks } from '../services/bookService'
import { getCategories } from '../services/categoryService'
import type { BookPageResponse, CatalogCategory } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency, renderCategoryIcon } from '../utils/catalog'

const PAGE_SIZE = 12
const DEFAULT_SORT = 'popularity,desc'

const sortOptions = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Popularity', value: 'popularity,desc' },
  { label: 'Price: Low to High', value: 'price,asc' },
  { label: 'Price: High to Low', value: 'price,desc' },
] as const

interface AsyncState<T> {
  data: T
  error: string | null
  isLoading: boolean
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="animate-pulse" key={index}>
          <div className="aspect-[2/3] bg-parchment-200" />
          <div className="border border-t-0 border-parchment-200 bg-white p-6">
            <div className="h-3 w-24 bg-parchment-200" />
            <div className="mt-4 h-7 w-3/4 bg-parchment-200" />
            <div className="mt-3 h-4 w-1/2 bg-parchment-100" />
            <div className="mt-6 space-y-3">
              <div className="h-3 w-full bg-parchment-100" />
              <div className="h-3 w-11/12 bg-parchment-100" />
              <div className="h-3 w-4/5 bg-parchment-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [reloadKey, setReloadKey] = useState(0)
  const [categoriesState, setCategoriesState] = useState<AsyncState<CatalogCategory[]>>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [booksState, setBooksState] = useState<AsyncState<BookPageResponse | null>>({
    data: null,
    error: null,
    isLoading: true,
  })

  const searchQuery = searchParams.get('q') ?? ''
  const selectedCategoryName = searchParams.get('category')
  const sortValue = searchParams.get('sort') ?? DEFAULT_SORT
  const inStockOnly = searchParams.get('inStockOnly') === 'true'
  const pageParam = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const selectedCategory =
    categoriesState.data.find((category) => category.name === selectedCategoryName) ?? null

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    let isActive = true

    async function loadCategories() {
      try {
        const categories = await getCategories()

        if (!isActive) {
          return
        }

        setCategoriesState({
          data: categories,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setCategoriesState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load catalog categories.'),
          isLoading: false,
        })
      }
    }

    setCategoriesState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    void loadCategories()

    return () => {
      isActive = false
    }
  }, [reloadKey])

  useEffect(() => {
    if (selectedCategoryName && categoriesState.isLoading) {
      return
    }

    let isActive = true

    async function loadBooks() {
      try {
        const books = await getBooks({
          categoryId: selectedCategory?.id,
          inStockOnly,
          page: currentPage - 1,
          q: searchQuery,
          size: PAGE_SIZE,
          sort: sortValue,
        })

        if (!isActive) {
          return
        }

        setBooksState({
          data: books,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setBooksState({
          data: null,
          error: getApiErrorMessage(error, 'Unable to load the Aurelia catalog.'),
          isLoading: false,
        })
      }
    }

    setBooksState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }))

    void loadBooks()

    return () => {
      isActive = false
    }
  }, [
    categoriesState.isLoading,
    currentPage,
    inStockOnly,
    reloadKey,
    searchQuery,
    selectedCategory?.id,
    selectedCategoryName,
    sortValue,
  ])

  const totalResults = booksState.data?.page.totalElements ?? 0
  const totalPages = booksState.data?.page.totalPages ?? 0
  const resultStart = booksState.data
    ? booksState.data.page.number * booksState.data.page.size + 1
    : 0
  const resultEnd = booksState.data
    ? Math.min(resultStart + booksState.data.content.length - 1, booksState.data.page.totalElements)
    : 0

  function setParam(name: string, value: string | null, resetPage = true) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(name, value)
    } else {
      nextParams.delete(name)
    }

    if (resetPage) {
      nextParams.delete('page')
    }

    startTransition(() => {
      setSearchParams(nextParams)
    })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setParam('q', searchInput.trim() || null)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    setParam('sort', event.target.value === DEFAULT_SORT ? null : event.target.value)
  }

  function handleCategoryChange(categoryName: string | null) {
    setParam('category', categoryName)
  }

  function handleInStockChange(event: ChangeEvent<HTMLInputElement>) {
    setParam('inStockOnly', event.target.checked ? 'true' : null)
  }

  function handlePageChange(page: number) {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(page))

    startTransition(() => {
      setSearchParams(nextParams)
    })
  }

  function handleClearFilters() {
    setSearchInput('')
    startTransition(() => {
      setSearchParams(new URLSearchParams())
    })
  }

  return (
    <main className="flex-1">
      <section className="border-b border-parchment-200 bg-white">
        <div className="mx-auto grid max-w-content gap-12 px-8 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-20">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-eyebrow text-crimson-700">
              Phase III Catalogue
            </span>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-ink-900 md:text-6xl">
              New &amp; notable
              <br />
              editions to browse
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ink-500">
              Search the Aurelia shelves, filter by curated category, and sort the
              collection by price or recency. The catalog is driven by the live Spring
              Boot API and seeded with a full editorial selection.
            </p>
          </div>

          <div className="grid gap-4 border border-parchment-200 bg-parchment-100 p-6 md:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">
                Available Now
              </span>
              <p className="mt-3 font-serif text-3xl text-ink-900">
                {categoriesState.isLoading && !booksState.data ? '...' : totalResults}
              </p>
              <p className="mt-2 text-sm text-ink-500">Live bookstore editions</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">
                Curated Shelves
              </span>
              <p className="mt-3 font-serif text-3xl text-ink-900">
                {categoriesState.isLoading ? '...' : categoriesState.data.length}
              </p>
              <p className="mt-2 text-sm text-ink-500">Editorial categories</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-nav text-ink-500">
                Current Filter
              </span>
              <p className="mt-3 font-serif text-3xl text-ink-900">
                {selectedCategory?.name ?? 'All'}
              </p>
              <p className="mt-2 text-sm text-ink-500">
                {inStockOnly ? 'In-stock only' : 'Full collection'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-parchment-50 py-12 md:py-16">
        <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit border border-parchment-200 bg-white p-6 lg:sticky lg:top-36">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                  Browse By
                </span>
                <h2 className="mt-2 font-serif text-2xl text-ink-900">Categories</h2>
              </div>
              <SlidersHorizontal className="text-2xl text-ink-500" />
            </div>

            <div className="mt-6 space-y-2">
              <button
                className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition-colors ${
                  !selectedCategoryName
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-parchment-200 bg-parchment-50 text-ink-800 hover:border-ink-900'
                }`}
                onClick={() => handleCategoryChange(null)}
                type="button"
              >
                <span>All Categories</span>
                <span className="text-[10px] uppercase tracking-nav">View All</span>
              </button>

              {categoriesState.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div className="h-12 animate-pulse bg-parchment-100" key={index} />
                  ))
                : null}

              {!categoriesState.isLoading
                ? categoriesState.data.map((category) => {
                    const isSelected = category.name === selectedCategoryName

                    return (
                      <button
                        className={`flex w-full items-center justify-between border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'border-crimson-700 bg-crimson-700 text-white'
                            : 'border-parchment-200 bg-white text-ink-800 hover:border-ink-900 hover:bg-parchment-50'
                        }`}
                        key={category.id}
                        onClick={() => handleCategoryChange(category.name)}
                        type="button"
                      >
                        <span className="flex items-center gap-3 text-sm">
                          {renderCategoryIcon(category.iconName, 'text-lg')}
                          {category.name}
                        </span>
                        <CaretRight className="text-sm" />
                      </button>
                    )
                  })
                : null}
            </div>

            {categoriesState.error ? (
              <div className="mt-5 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                {categoriesState.error}
              </div>
            ) : null}

            <div className="mt-8 border-t border-parchment-200 pt-6">
              <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                Next Step
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-500">
                Detailed edition pages follow in the next phase. For now, use the live
                filters here to browse the full seeded catalog.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 border border-ink-900 px-4 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                to="/"
              >
                <CaretLeft className="text-sm" />
                Return Home
              </Link>
            </div>
          </aside>

          <div className="space-y-8">
            <section className="border border-parchment-200 bg-white p-6 md:p-8">
              <form
                className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
                onSubmit={handleSearchSubmit}
              >
                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Search The Catalogue
                  </span>
                  <div className="flex items-center border border-parchment-200 bg-parchment-50 px-4 focus-within:border-ink-900">
                    <MagnifyingGlass className="mr-3 text-lg text-ink-500" />
                    <input
                      className="w-full bg-transparent py-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-500"
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Title, author, or description"
                      type="search"
                      value={searchInput}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Sort By
                  </span>
                  <select
                    className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                    onChange={handleSortChange}
                    value={sortValue}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="mt-auto bg-ink-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                  type="submit"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-4 border-t border-parchment-200 pt-5 md:flex-row md:items-center md:justify-between">
                <label className="inline-flex items-center gap-3 text-sm text-ink-800">
                  <input
                    checked={inStockOnly}
                    className="h-4 w-4 border-parchment-200 accent-ink-900"
                    onChange={handleInStockChange}
                    type="checkbox"
                  />
                  Only show books currently in stock
                </label>

                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <span>
                    {booksState.data
                      ? `Showing ${resultStart}-${resultEnd} of ${totalResults}`
                      : 'Loading results'}
                  </span>
                  {searchQuery || selectedCategoryName || inStockOnly || sortValue !== DEFAULT_SORT ? (
                    <button
                      className="inline-flex items-center gap-2 border border-parchment-200 px-4 py-2 text-xs uppercase tracking-nav text-ink-800 transition-colors hover:border-ink-900"
                      onClick={handleClearFilters}
                      type="button"
                    >
                      <FunnelSimpleX className="text-sm" />
                      Clear Filters
                    </button>
                  ) : null}
                </div>
              </div>

              {(selectedCategory || inStockOnly || searchQuery) && !booksState.isLoading ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedCategory ? (
                    <span className="border border-crimson-700/20 bg-crimson-700/5 px-3 py-1 text-[10px] uppercase tracking-nav text-crimson-800">
                      {selectedCategory.name}
                    </span>
                  ) : null}
                  {inStockOnly ? (
                    <span className="border border-ink-900/10 bg-parchment-50 px-3 py-1 text-[10px] uppercase tracking-nav text-ink-800">
                      In Stock Only
                    </span>
                  ) : null}
                  {searchQuery ? (
                    <span className="border border-ink-900/10 bg-parchment-50 px-3 py-1 text-[10px] uppercase tracking-nav text-ink-800">
                      Search: {searchQuery}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section>
              {booksState.isLoading ? <CatalogSkeleton /> : null}

              {!booksState.isLoading && booksState.error ? (
                <FeedbackPanel
                  actions={
                    <button
                      className="inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
                      onClick={() => setReloadKey((currentValue) => currentValue + 1)}
                      type="button"
                    >
                      <ArrowCounterClockwise className="text-sm" />
                      Retry
                    </button>
                  }
                  description={booksState.error}
                  eyebrow="Catalog"
                  title="Catalog unavailable"
                  tone="error"
                />
              ) : null}

              {!booksState.isLoading && !booksState.error && booksState.data?.content.length === 0 ? (
                <FeedbackPanel
                  actions={
                    <button
                      className="border border-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                      onClick={handleClearFilters}
                      type="button"
                    >
                      View Full Catalogue
                    </button>
                  }
                  description="Try clearing the current filters or broadening your search terms to reveal more of the Aurelia collection."
                  eyebrow="Catalog"
                  title="No books found"
                />
              ) : null}

              {!booksState.isLoading && booksState.data?.content.length ? (
                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {booksState.data.content.map((book) => (
                    <BookCard book={book} key={book.id} />
                  ))}
                </div>
              ) : null}
            </section>

            {!booksState.isLoading && totalPages > 1 ? (
              <section className="flex flex-col items-center justify-between gap-4 border-t border-parchment-200 pt-8 md:flex-row">
                <div className="text-sm text-ink-500">
                  Page {currentPage} of {totalPages}
                  {booksState.data ? (
                    <span className="ml-2 text-ink-800">
                      · Current page starts at{' '}
                      {formatCurrency(
                        booksState.data.content.reduce(
                          (lowestPrice, book) => Math.min(lowestPrice, book.price),
                          booksState.data.content[0]?.price ?? 0,
                        ),
                      )}
                    </span>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <button
                    className="inline-flex items-center gap-2 border border-parchment-200 px-4 py-3 text-xs uppercase tracking-nav text-ink-800 transition-colors hover:border-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => handlePageChange(currentPage - 1)}
                    type="button"
                  >
                    <CaretLeft className="text-sm" />
                    Previous
                  </button>
                  <button
                    className="inline-flex items-center gap-2 bg-ink-900 px-4 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                    disabled={currentPage >= totalPages || isPending}
                    onClick={() => handlePageChange(currentPage + 1)}
                    type="button"
                  >
                    Next
                    <CaretRight className="text-sm" />
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}

export default BooksPage
