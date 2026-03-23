import api from './api'

import type { CatalogCategory } from '../types/catalog'

export async function getCategories() {
  const response = await api.get<CatalogCategory[]>('/categories')
  return response.data
}
