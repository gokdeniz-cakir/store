import api from './api'

import type { CreateReviewPayload, Review } from '../types/review'

export async function getApprovedReviews(bookId: number) {
  const response = await api.get<Review[]>(`/books/${bookId}/reviews`)
  return response.data
}

export async function createReview(bookId: number, payload: CreateReviewPayload) {
  const response = await api.post<Review>(`/books/${bookId}/reviews`, payload)
  return response.data
}
