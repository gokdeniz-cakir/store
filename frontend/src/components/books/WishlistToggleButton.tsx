import { Heart } from '@phosphor-icons/react'
import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useWishlist } from '../../hooks/useWishlist'
import type { Book } from '../../types/catalog'

interface WishlistToggleButtonProps {
  book: Book
  variant?: 'compact' | 'full'
}

function WishlistToggleButton({
  book,
  variant = 'compact',
}: WishlistToggleButtonProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addToWishlist, isWishlisted, removeFromWishlist } = useWishlist()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const active = isWishlisted(book.id)
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER'
  const isFullVariant = variant === 'full'

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login', {
        replace: false,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      })
      return
    }

    if (!isCustomer) {
      navigate('/account')
      return
    }

    setIsSubmitting(true)

    try {
      if (active) {
        await removeFromWishlist(book.id)
      } else {
        await addToWishlist(book)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={
        isFullVariant
          ? `inline-flex items-center justify-center gap-3 border px-8 py-4 text-xs font-semibold uppercase tracking-nav transition-colors ${
              active
                ? 'border-crimson-700 bg-crimson-700 text-white hover:bg-crimson-800'
                : 'border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white'
            }`
          : `inline-flex h-11 w-11 items-center justify-center border transition-colors ${
              active
                ? 'border-crimson-700 bg-crimson-700 text-white hover:bg-crimson-800'
                : 'border-parchment-200 bg-parchment-50 text-ink-700 hover:border-ink-900 hover:bg-white'
            }`
      }
      disabled={isSubmitting}
      onClick={handleClick}
      title={active ? 'Saved to wishlist' : 'Save to wishlist'}
      type="button"
    >
      <Heart className={isFullVariant ? 'text-base' : 'text-lg'} weight={active ? 'fill' : 'regular'} />
      {isFullVariant ? (
        <span>
          {isSubmitting ? 'Updating...' : active ? 'Saved To Wishlist' : 'Save To Wishlist'}
        </span>
      ) : null}
    </button>
  )
}

export default WishlistToggleButton
