import api from './api'

import type { WishlistItem } from '../types/wishlist'

export async function getWishlist() {
  const response = await api.get<WishlistItem[]>('/wishlist')
  return response.data
}

export async function addWishlistItem(bookId: number) {
  const response = await api.post<WishlistItem>(`/wishlist/${bookId}`)
  return response.data
}

export async function removeWishlistItem(bookId: number) {
  await api.delete(`/wishlist/${bookId}`)
}
