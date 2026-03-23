import { Check, Quotes, Star, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import { approveReview, getPendingReviews, rejectReview } from '../services/reviewService'
import type { Review } from '../types/review'
import { getApiErrorMessage } from '../utils/apiError'

interface AsyncState {
  data: Review[]
  error: string | null
  isLoading: boolean
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleString()
}

function AdminReviewsPage() {
  const [reviewState, setReviewState] = useState<AsyncState>({
    data: [],
    error: null,
    isLoading: true,
  })
  const [actingReviewId, setActingReviewId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadReviews() {
      try {
        const reviews = await getPendingReviews()

        if (!isActive) {
          return
        }

        setReviewState({
          data: reviews,
          error: null,
          isLoading: false,
        })
      } catch (error: unknown) {
        if (!isActive) {
          return
        }

        setReviewState({
          data: [],
          error: getApiErrorMessage(error, 'Unable to load pending reviews.'),
          isLoading: false,
        })
      }
    }

    void loadReviews()

    return () => {
      isActive = false
    }
  }, [])

  async function handleApprove(reviewId: number) {
    setActingReviewId(reviewId)
    setActionError(null)

    try {
      await approveReview(reviewId)
      setReviewState((currentState) => ({
        ...currentState,
        data: currentState.data.filter((review) => review.id !== reviewId),
      }))
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to approve this review.'))
    } finally {
      setActingReviewId(null)
    }
  }

  async function handleReject(reviewId: number) {
    setActingReviewId(reviewId)
    setActionError(null)

    try {
      await rejectReview(reviewId)
      setReviewState((currentState) => ({
        ...currentState,
        data: currentState.data.filter((review) => review.id !== reviewId),
      }))
    } catch (error: unknown) {
      setActionError(getApiErrorMessage(error, 'Unable to reject this review.'))
    } finally {
      setActingReviewId(null)
    }
  }

  return (
    <main className="px-8 py-10 md:px-10 md:py-12">
      <section className="border border-parchment-200 bg-white p-8 md:p-10">
        <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
          Product Manager
        </span>
        <h1 className="mt-5 font-serif text-5xl leading-[1.02] text-ink-900">Review moderation</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-500">
          Approve customer reviews before they appear publicly on book detail pages and
          influence popularity sorting.
        </p>
      </section>

      {actionError ? (
        <div className="mt-8 border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
          {actionError}
        </div>
      ) : null}

      <section className="mt-8 border border-parchment-200 bg-white p-6">
        {reviewState.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="h-40 animate-pulse border border-parchment-200 bg-parchment-50" key={index} />
            ))}
          </div>
        ) : null}

        {!reviewState.isLoading && reviewState.error ? (
          <div className="border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
            {reviewState.error}
          </div>
        ) : null}

        {!reviewState.isLoading && !reviewState.error && reviewState.data.length === 0 ? (
          <div className="border border-parchment-200 bg-parchment-50 px-6 py-12 text-center">
            <Quotes className="mx-auto text-5xl text-ink-500" />
            <p className="mt-6 font-serif text-3xl text-ink-900">No pending reviews</p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
              New submissions will appear here until you approve or reject them.
            </p>
          </div>
        ) : null}

        {!reviewState.isLoading && reviewState.data.length > 0 ? (
          <div className="space-y-4">
            {reviewState.data.map((review) => (
              <article
                className="grid gap-5 border border-parchment-200 bg-parchment-50 p-5 xl:grid-cols-[minmax(0,1fr)_240px]"
                key={review.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                      {review.bookTitle}
                    </span>
                    <span className="border border-parchment-200 bg-white px-3 py-1 text-[10px] uppercase tracking-nav text-ink-500">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-ink-500">
                    {review.customerName ?? 'Aurelia customer'}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-gold-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        className="text-base"
                        key={index}
                        weight={index < review.rating ? 'fill' : 'regular'}
                      />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-ink-800">
                    {review.comment?.trim() || 'This customer submitted a star rating without a comment.'}
                  </p>
                </div>

                <div className="flex flex-col justify-end gap-3 border-l border-parchment-200 pl-5">
                  <button
                    className="inline-flex items-center justify-center gap-2 bg-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                    disabled={actingReviewId === review.id}
                    onClick={() => handleApprove(review.id)}
                    type="button"
                  >
                    <Check className="text-sm" />
                    {actingReviewId === review.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    className="inline-flex items-center justify-center gap-2 border border-crimson-700 px-5 py-3 text-xs uppercase tracking-nav text-crimson-700 transition-colors hover:bg-crimson-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={actingReviewId === review.id}
                    onClick={() => handleReject(review.id)}
                    type="button"
                  >
                    <Trash className="text-sm" />
                    {actingReviewId === review.id ? 'Updating...' : 'Reject'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default AdminReviewsPage
