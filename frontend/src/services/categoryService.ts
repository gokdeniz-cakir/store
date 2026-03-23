import api from './api'

import type { CatalogCategory, CategoryRequest } from '../types/catalog'

export async function getCategories() {
  const response = await api.get<CatalogCategory[]>('/categories')
  return response.data
}

export async function createCategory(payload: CategoryRequest) {
  const response = await api.post<CatalogCategory>('/categories', payload)
  return response.data
}

export async function updateCategory(categoryId: number, payload: CategoryRequest) {
  const response = await api.put<CatalogCategory>(`/categories/${categoryId}`, payload)
  return response.data
}

export async function deleteCategory(categoryId: number) {
  await api.delete(`/categories/${categoryId}`)
}
