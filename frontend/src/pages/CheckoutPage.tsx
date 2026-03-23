import { CreditCard, LockKey, MapPinLine, Receipt } from '@phosphor-icons/react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { placeOrder } from '../services/orderService'
import { getApiErrorMessage } from '../utils/apiError'
import { formatCurrency } from '../utils/catalog'

function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, clearCart, itemCount, subtotal } = useCart()
  const [formState, setFormState] = useState({
    shippingAddress: '',
    cardNumber: '',
    cardholderName: user?.name ?? '',
    expiryMonth: '',
    expiryYear: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (cartItems.length === 0) {
    return <Navigate replace to="/cart" />
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const order = await placeOrder({
        shippingAddress: formState.shippingAddress,
        creditCard: {
          cardNumber: formState.cardNumber.replace(/\s+/g, ''),
          cardholderName: formState.cardholderName,
          expiryMonth: Number(formState.expiryMonth),
          expiryYear: Number(formState.expiryYear),
        },
        items: cartItems.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
      })

      clearCart()
      navigate(`/orders/${order.id}/confirmation`, {
        replace: true,
      })
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to place the order.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 bg-parchment-50 py-16 md:py-20">
      <div className="mx-auto grid max-w-content gap-10 px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="border border-parchment-200 bg-white p-8 md:p-10">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Checkout
          </span>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink-900">
            Finalize your order
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-500">
            Confirm the shipping address and payment details for the books currently in
            your cart. Order placement uses the authenticated customer account only.
          </p>

          <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
            <section>
              <div className="flex items-center gap-3">
                <MapPinLine className="text-2xl text-crimson-700" />
                <h2 className="font-serif text-2xl text-ink-900">Shipping Address</h2>
              </div>
              <textarea
                className="mt-5 min-h-40 w-full resize-none border border-parchment-200 bg-parchment-50 px-4 py-4 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                name="shippingAddress"
                onChange={handleChange}
                placeholder="Street, district, city, postal code"
                required
                value={formState.shippingAddress}
              />
            </section>

            <section>
              <div className="flex items-center gap-3">
                <CreditCard className="text-2xl text-crimson-700" />
                <h2 className="font-serif text-2xl text-ink-900">Payment Details</h2>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Card Number
                  </span>
                  <input
                    className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                    inputMode="numeric"
                    name="cardNumber"
                    onChange={handleChange}
                    placeholder="4111 1111 1111 1111"
                    required
                    value={formState.cardNumber}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Cardholder Name
                  </span>
                  <input
                    className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                    name="cardholderName"
                    onChange={handleChange}
                    required
                    value={formState.cardholderName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Expiry Month
                  </span>
                  <input
                    className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                    max={12}
                    min={1}
                    name="expiryMonth"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formState.expiryMonth}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] uppercase tracking-nav text-ink-500">
                    Expiry Year
                  </span>
                  <input
                    className="w-full border border-parchment-200 bg-parchment-50 px-4 py-3.5 text-sm text-ink-900 outline-none transition-colors focus:border-ink-900"
                    min={new Date().getFullYear()}
                    name="expiryYear"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formState.expiryYear}
                  />
                </label>
              </div>
            </section>

            {errorMessage ? (
              <div className="border border-crimson-700/20 bg-crimson-700/5 px-4 py-3 text-sm text-crimson-800">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 md:flex-row">
              <button
                className="inline-flex items-center justify-center gap-3 bg-ink-900 px-8 py-4 text-xs font-semibold uppercase tracking-nav text-white transition-colors hover:bg-crimson-700 disabled:cursor-not-allowed disabled:bg-ink-500"
                disabled={isSubmitting}
                type="submit"
              >
                <LockKey className="text-base" />
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
              <Link
                className="inline-flex items-center justify-center border border-ink-900 px-8 py-4 text-xs font-semibold uppercase tracking-nav text-ink-900 transition-colors hover:bg-ink-900 hover:text-white"
                to="/cart"
              >
                Return To Cart
              </Link>
            </div>
          </form>
        </section>

        <aside className="h-fit border border-parchment-200 bg-white p-8 lg:sticky lg:top-36">
          <span className="text-[10px] uppercase tracking-eyebrow text-crimson-700">
            Order Summary
          </span>
          <h2 className="mt-4 font-serif text-3xl text-ink-900">Books in this order</h2>

          <div className="mt-8 space-y-4">
            {cartItems.map((item) => (
              <div className="border-b border-parchment-200 pb-4" key={item.bookId}>
                <p className="font-serif text-xl text-ink-900">{item.title}</p>
                <p className="mt-1 text-sm text-ink-500">{item.author}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-ink-800">
                  <span>{item.quantity} × {formatCurrency(item.price)}</span>
                  <span>{formatCurrency(item.quantity * item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-b border-parchment-200 pb-4 text-sm text-ink-800">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="mt-4 flex items-center justify-between font-serif text-2xl text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="mt-8 border border-parchment-200 bg-parchment-50 p-5">
            <div className="flex items-center gap-3">
              <Receipt className="text-xl text-crimson-700" />
              <p className="text-sm leading-7 text-ink-500">
                Orders are created in `PROCESSING` state and immediately available in
                your order history.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default CheckoutPage
