import type { Book, CatalogCategory } from './catalog'

export interface WishlistItem {
  id: number
  bookId: number
  title: string
  author: string
  edition: string
  price: number
  originalPrice: number | null
  stockQuantity: number
  coverColor: string
  category: CatalogCategory
  averageRating: number
  reviewCount: number
  addedAt: string
}

export interface WishlistContextValue {
  addToWishlist: (book: Book) => Promise<void>
  error: string | null
  isLoading: boolean
  isWishlisted: (bookId: number) => boolean
  itemCount: number
  refresh: () => Promise<void>
  removeFromWishlist: (bookId: number) => Promise<void>
  wishlistItems: WishlistItem[]
}
