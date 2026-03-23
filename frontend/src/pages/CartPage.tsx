import { ArrowRight, ShoppingBagOpen, Trash } from '@phosphor-icons/react'
import { useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { formatCurrency, getCoverPresentation, renderCategoryIcon } from '../utils/catalog'

function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems, clearCart, itemCount, removeItem, subtotal, updateQuantity } = useCart()
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null)

  function handleQuantityChange(bookId: number, event: ChangeEvent<HTMLInputElement>) {
    const nextQuantity = Number(event.target.value)

    if (!Number.isFinite(nextQuantity)) {
      return
    }

    updateQuantity(bookId, nextQuantity)
  }

  function handleCheckout() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    setCheckoutNotice('Checkout form delivery continues in Phase 4. Your cart is ready for that step.')
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex-1 bg-parchment-50 py-20">
        <div className="mx-auto max-w-3xl border border-parchment-200 bg-white px-8 py-16 text-center">
          <ShoppingBagOpen className="mx-auto text-5xl text-ink-500" />
          <p className="mt-6 text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Your Cart Is Empty
          </p>
          <h1 className="mt-4 font-serif text-4xl text-ink-900">Nothing on the trolley yet</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-500">
            Browse the Aurelia catalogue and add books from the detail page. Guest cart
            selections persist locally in your browser.
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
            to="/books"
          >
            Browse Catalogue
            <ArrowRight className="text-sm" />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
              Cart Ledger
            </span>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink-900">
              Your selected editions
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-500">
              Adjust quantities, remove items, and proceed to checkout when ready.
            </p>
          </div>

          <div className="space-y-6">
            {cartItems.map((item) => {
              const coverPresentation = getCoverPresentation(item.coverColor)

              return (
                <article
                  className="grid gap-6 border border-parchment-200 bg-white p-6 md:grid-cols-[150px_minmax(0,1fr)]"
                  key={item.bookId}
                >
                  <Link
                    className="block"
                    to={`/books/${item.bookId}`}
                  >
                    <div
                      className="book-shadow book-spine-left relative flex aspect-[2/3] items-center justify-center overflow-hidden px-4 py-5"
                      style={{ backgroundColor: item.coverColor }}
                    >
                      <div className={`absolute inset-3 border ${coverPresentation.borderClassName}`} />
                      <div className="relative z-10 text-center">
                        {renderCategoryIcon(
                          item.categoryIconName,
                          `mx-auto mb-3 text-[24px] ${coverPresentation.iconClassName}`,
                        )}
                        <h2
                          className={`font-serif text-lg uppercase tracking-[0.18em] ${coverPresentation.textClassName}`}
                        >
                          {item.title}
                        </h2>
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
                          {item.edition}
                        </p>
                        <Link
                          className="mt-2 block font-serif text-3xl leading-tight text-ink-900 transition-colors hover:text-crimson-700"
                          to={`/books/${item.bookId}`}
                        >
                          {item.title}
                        </Link>
                        <p className="mt-2 text-sm text-ink-500">{item.author}</p>
                        <p className="mt-2 text-sm text-ink-500">{item.categoryName}</p>
                      </div>

                      <button
                        className="inline-flex items-center gap-2 self-start border border-parchment-200 px-4 py-2 text-[10px] uppercase tracking-nav text-ink-800 transition-colors hover:border-crimson-700 hover:text-crimson-700"
                        onClick={() => removeItem(item.bookId)}
                        type="button"
                      >
                        <Trash className="text-sm" />
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 border-t border-parchment-200 pt-5 md:grid-cols-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-nav text-ink-500">Unit Price</p>
                        <p className="mt-2 text-base text-ink-900">{formatCurrency(item.price)}</p>
                      </div>
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-nav text-ink-500">
                          Quantity
                        </span>
                        <input
                          className="mt-2 w-full border border-parchment-200 bg-parchment-50 px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                          max={item.stockQuantity}
                          min={1}
                          onChange={(event) => handleQuantityChange(item.bookId, event)}
                          type="number"
                          value={item.quantity}
                        />
                      </label>
                      <div>
                        <p className="text-[10px] uppercase tracking-nav text-ink-500">Line Total</p>
                        <p className="mt-2 font-serif text-2xl text-ink-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <aside className="h-fit border border-parchment-200 bg-white p-8 lg:sticky lg:top-36">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Order Summary
          </span>
          <h2 className="mt-4 font-serif text-3xl text-ink-900">Current cart totals</h2>

          <dl className="mt-8 space-y-4 text-sm text-ink-800">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
              <dt>Items</dt>
              <dd>{itemCount}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
            <div className="flex items-center justify-between font-serif text-2xl text-ink-900">
              <dt>Total</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
          </dl>

          <button
            className="mt-8 w-full bg-ink-900 px-6 py-4 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700"
            onClick={handleCheckout}
            type="button"
          >
            Proceed To Checkout
          </button>

          {!isAuthenticated ? (
            <p className="mt-4 text-sm leading-7 text-ink-500">
              Guests are redirected to sign in before checkout. Your cart remains stored
              locally while you authenticate.
            </p>
          ) : null}

          {checkoutNotice ? (
            <div className="mt-5 border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-ink-800">
              {checkoutNotice}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              className="inline-flex items-center justify-center border border-ink-900 px-5 py-3 text-xs uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
              to="/books"
            >
              Continue Shopping
            </Link>
            <button
              className="inline-flex items-center justify-center border border-parchment-200 px-5 py-3 text-xs uppercase tracking-nav text-ink-800 transition-colors hover:border-crimson-700 hover:text-crimson-700"
              onClick={clearCart}
              type="button"
            >
              Clear Cart
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default CartPage
