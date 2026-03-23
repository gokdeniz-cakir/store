import { useEffect, useState, type ReactNode } from 'react'

import { CartContext } from './cartContext'
import type { Book } from '../types/catalog'
import type { CartItem } from '../types/cart'

const CART_STORAGE_KEY = 'aurelia_cart'

function readStoredCart() {
  const rawValue = localStorage.getItem(CART_STORAGE_KEY)

  if (!rawValue) {
    return [] as CartItem[]
  }

  try {
    return JSON.parse(rawValue) as CartItem[]
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY)
    return [] as CartItem[]
  }
}

function buildCartItem(book: Book, quantity: number): CartItem {
  return {
    author: book.author,
    bookId: book.id,
    categoryIconName: book.category.iconName,
    categoryName: book.category.name,
    coverColor: book.coverColor,
    edition: book.edition,
    price: book.price,
    quantity,
    stockQuantity: book.stockQuantity,
    title: book.title,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState(readStoredCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  function addItem(book: Book, quantity = 1) {
    if (book.stockQuantity <= 0) {
      return
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.bookId === book.id)

      if (!existingItem) {
        return [...currentItems, buildCartItem(book, Math.min(quantity, book.stockQuantity))]
      }

      return currentItems.map((item) =>
        item.bookId === book.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, book.stockQuantity),
              stockQuantity: book.stockQuantity,
            }
          : item,
      )
    })
  }

  function updateQuantity(bookId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(bookId)
      return
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.bookId === bookId
          ? {
              ...item,
              quantity: Math.min(quantity, Math.max(item.stockQuantity, 1)),
            }
          : item,
      ),
    )
  }

  function removeItem(bookId: number) {
    setCartItems((currentItems) => currentItems.filter((item) => item.bookId !== bookId))
  }

  function clearCart() {
    setCartItems([])
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        addItem,
        cartItems,
        clearCart,
        itemCount,
        removeItem,
        subtotal,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
