import { useCallback, useEffect, useState, type ReactNode } from 'react'

import { WishlistContext } from './wishlistContext'
import { useAuth } from '../hooks/useAuth'
import { addWishlistItem, getWishlist, removeWishlistItem } from '../services/wishlistService'
import type { Book } from '../types/catalog'
import type { WishlistItem } from '../types/wishlist'
import { getApiErrorMessage } from '../utils/apiError'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER'

  const loadWishlistForCurrentUser = useCallback(async () => {
    if (!isCustomer) {
      setWishlistItems([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const items = await getWishlist()
      setWishlistItems(items)
    } catch (refreshError: unknown) {
      setWishlistItems([])
      setError(getApiErrorMessage(refreshError, 'Unable to load your wishlist.'))
    } finally {
      setIsLoading(false)
    }
  }, [isCustomer])

  useEffect(() => {
    void loadWishlistForCurrentUser()
  }, [loadWishlistForCurrentUser, user?.email])

  async function refresh() {
    await loadWishlistForCurrentUser()
  }

  async function addToWishlist(book: Book) {
    if (!isCustomer) {
      throw new Error('Sign in with a customer account to save wishlist items.')
    }

    if (wishlistItems.some((item) => item.bookId === book.id)) {
      return
    }

    setError(null)

    try {
      const wishlistItem = await addWishlistItem(book.id)
      setWishlistItems((currentItems) => [wishlistItem, ...currentItems])
    } catch (wishlistError: unknown) {
      const message = getApiErrorMessage(wishlistError, 'Unable to add this book to your wishlist.')
      setError(message)
      throw new Error(message)
    }
  }

  async function removeFromWishlist(bookId: number) {
    if (!isCustomer) {
      throw new Error('Sign in with a customer account to manage wishlist items.')
    }

    setError(null)

    try {
      await removeWishlistItem(bookId)
      setWishlistItems((currentItems) => currentItems.filter((item) => item.bookId !== bookId))
    } catch (wishlistError: unknown) {
      const message = getApiErrorMessage(
        wishlistError,
        'Unable to remove this book from your wishlist.',
      )
      setError(message)
      throw new Error(message)
    }
  }

  function isWishlisted(bookId: number) {
    return wishlistItems.some((item) => item.bookId === bookId)
  }

  return (
    <WishlistContext.Provider
      value={{
        addToWishlist,
        error,
        isLoading,
        isWishlisted,
        itemCount: wishlistItems.length,
        refresh,
        removeFromWishlist,
        wishlistItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
