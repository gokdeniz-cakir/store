export interface Review {
  id: number
  bookId: number
  bookTitle: string
  customerName: string | null
  rating: number
  comment: string | null
  approved: boolean
  createdAt: string
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
}
