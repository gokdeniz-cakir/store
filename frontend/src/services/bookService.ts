import api from './api'

import type { Book, BookPageResponse, RawBookPageResponse } from '../types/catalog'

interface GetBooksParams {
  categoryId?: number
  inStockOnly?: boolean
  page?: number
  q?: string
  size?: number
  sort?: string
}

function normalizePageResponse(data: RawBookPageResponse): BookPageResponse {
  return {
    content: data.content,
    page: {
      number: data.page?.number ?? data.number ?? 0,
      size: data.page?.size ?? data.size ?? data.content.length,
      totalElements: data.page?.totalElements ?? data.totalElements ?? data.content.length,
      totalPages: data.page?.totalPages ?? data.totalPages ?? 1,
    },
  }
}

export async function getBooks(params: GetBooksParams) {
  const response = await api.get<RawBookPageResponse>('/books', {
    params: {
      categoryId: params.categoryId,
      inStockOnly: params.inStockOnly || undefined,
      page: params.page ?? 0,
      q: params.q?.trim() || undefined,
      size: params.size ?? 12,
      sort: params.sort,
    },
  })

  return normalizePageResponse(response.data)
}

export async function getBook(bookId: number) {
  const response = await api.get<Book>(`/books/${bookId}`)
  return response.data
}
