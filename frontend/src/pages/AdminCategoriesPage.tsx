import { FloppyDisk, NotePencil, Plus, Trash, X } from '@phosphor-icons/react'
import { useEffect, useState, type FormEvent } from 'react'

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import type { CatalogCategory, CategoryRequest } from '../types/catalog'
import { getApiErrorMessage } from '../utils/apiError'
import { renderCategoryIcon } from '../utils/catalog'

interface CategoryFormState {
  name: string
  description: string
  iconName: string
}

const emptyCategoryFormState: CategoryFormState = {
  name: '',
  description: '',
  iconName: 'BookOpen',
}

const iconOptions = [
  'BookOpen',
  'Bookmarks',
  'RocketLaunch',
  'Scroll',
  'Bank',
  'MagnifyingGlass',
] as const

function toCategoryFormState(category: CatalogCategory): CategoryFormState {
  return {
    name: category.name,
    description: category.description ?? '',
    iconName: category.iconName,
  }
}

function toCategoryRequest(formState: CategoryFormState): CategoryRequest {
  return {
    name: formState.name.trim(),
    description: formState.description.trim() || null,
    iconName: formState.iconName,
  }
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [formState, setFormState] = useState<CategoryFormState>(emptyCategoryFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadCategoriesList() {
      try {
        const data = await getCategories()

        if (!isActive) {
          return
        }

        setCategories(data)
        setErrorMessage(null)
        setIsLoading(false)
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setErrorMessage(getApiErrorMessage(error, 'Unable to load categories.'))
        setIsLoading(false)
      }
    }

    void loadCategoriesList()

    return () => {
      isActive = false
    }
  }, [])

  function resetForm() {
    setSelectedCategoryId(null)
    setFormState(emptyCategoryFormState)
    setErrorMessage(null)
    setNotice(null)
  }

  function handleEdit(category: CatalogCategory) {
    setSelectedCategoryId(category.id)
    setFormState(toCategoryFormState(category))
    setErrorMessage(null)
    setNotice(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      const payload = toCategoryRequest(formState)
      const savedCategory = selectedCategoryId
        ? await updateCategory(selectedCategoryId, payload)
        : await createCategory(payload)

      setCategories((currentCategories) => {
        if (selectedCategoryId) {
          return currentCategories.map((category) =>
            category.id === savedCategory.id ? savedCategory : category,
          )
        }

        return [...currentCategories, savedCategory]
      })

      setSelectedCategoryId(savedCategory.id)
      setFormState(toCategoryFormState(savedCategory))
      setNotice(selectedCategoryId ? 'Category updated successfully.' : 'Category created successfully.')
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save this category.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(categoryId: number) {
    setDeletingCategoryId(categoryId)
    setErrorMessage(null)
    setNotice(null)

    try {
      await deleteCategory(categoryId)
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      )

      if (selectedCategoryId === categoryId) {
        resetForm()
      }

      setNotice('Category deleted successfully.')
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to delete this category.'))
    } finally {
      setDeletingCategoryId(null)
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
              Category management
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
              Curate the shelf taxonomy and icon mapping used across the storefront
              filters, cards, and detail pages.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
            onClick={resetForm}
            type="button"
          >
            <Plus className="text-sm" />
            New Category
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <article className="border border-parchment-200 bg-white p-6">
          <div className="border-b border-parchment-200 pb-4">
            <h2 className="font-serif text-3xl text-ink-900">Current shelves</h2>
            <p className="mt-2 text-sm text-ink-500">{categories.length} categories loaded.</p>
          </div>

          {isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="h-24 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
              ))}
            </div>
          ) : null}

          {errorMessage && !categories.length ? (
            <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading ? (
            <div className="mt-6 space-y-4">
              {categories.map((category) => (
                <article
                  className="grid gap-4 border border-parchment-200 bg-parchment-50 p-5 md:grid-cols-[minmax(0,1fr)_auto]"
                  key={category.id}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center border border-parchment-200 bg-white text-ink-900">
                        {renderCategoryIcon(category.iconName, 'text-2xl')}
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl text-ink-900">{category.name}</h3>
                        <p className="mt-1 text-sm text-ink-500">{category.iconName}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-ink-500">
                      {category.description || 'No description set for this category yet.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-3">
                    <button
                      className="inline-flex items-center gap-2 border border-ink-900 px-4 py-2 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                      onClick={() => handleEdit(category)}
                      type="button"
                    >
                      <NotePencil className="text-sm" />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 border border-crimson-700 px-4 py-2 text-xs uppercase tracking-nav text-crimson-700 transition-colors hover:bg-crimson-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingCategoryId === category.id}
                      onClick={() => handleDelete(category.id)}
                      type="button"
                    >
                      <Trash className="text-sm" />
                      {deletingCategoryId === category.id ? 'Deleting...' : 'Delete'}
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
                {selectedCategoryId ? 'Edit category' : 'Add category'}
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                Adjust the public-facing category name, summary, and icon.
              </p>
            </div>
            {selectedCategoryId ? (
              <button
                className="inline-flex h-10 w-10 items-center justify-center border border-parchment-200 text-ink-500 transition-colors hover:border-ink-900 hover:text-ink-900"
                onClick={resetForm}
                type="button"
              >
                <X className="text-lg" />
              </button>
            ) : null}
          </div>

          {errorMessage && categories.length > 0 ? (
            <div className="mt-6 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
              {errorMessage}
            </div>
          ) : null}

          {notice ? (
            <div className="mt-6 border border-gold-500/20 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
              {notice}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                Name
              </span>
              <input
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    name: event.target.value,
                  }))
                }
                required
                type="text"
                value={formState.name}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                Icon
              </span>
              <select
                className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    iconName: event.target.value,
                  }))
                }
                value={formState.iconName}
              >
                {iconOptions.map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-4 border border-parchment-200 bg-parchment-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center border border-parchment-200 bg-white text-ink-900">
                {renderCategoryIcon(formState.iconName, 'text-2xl')}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-nav text-ink-500">Preview</p>
                <p className="mt-1 text-sm text-ink-800">{formState.iconName}</p>
              </div>
            </div>

            <label className="block">
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

            <button
              className="inline-flex items-center justify-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
              disabled={isSubmitting}
              type="submit"
            >
              <FloppyDisk className="text-sm" />
              {isSubmitting
                ? 'Saving...'
                : selectedCategoryId
                  ? 'Update Category'
                  : 'Create Category'}
            </button>
          </form>
        </article>
      </section>
    </main>
  )
}

export default AdminCategoriesPage
