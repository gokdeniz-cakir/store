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

export async function getPendingReviews() {
  const response = await api.get<Review[]>('/reviews/pending')
  return response.data
}

export async function approveReview(reviewId: number) {
  const response = await api.patch<Review>(`/reviews/${reviewId}/approve`)
  return response.data
}

export async function rejectReview(reviewId: number) {
  await api.patch(`/reviews/${reviewId}/reject`)
}
