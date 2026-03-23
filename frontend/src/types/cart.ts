import type { Book } from './catalog'

export interface CartItem {
  author: string
  bookId: number
  categoryIconName: string
  categoryName: string
  coverColor: string
  edition: string
  price: number
  quantity: number
  stockQuantity: number
  title: string
}

export interface CartContextValue {
  addItem: (book: Book, quantity?: number) => void
  cartItems: CartItem[]
  clearCart: () => void
  itemCount: number
  removeItem: (bookId: number) => void
  subtotal: number
  updateQuantity: (bookId: number, quantity: number) => void
}
