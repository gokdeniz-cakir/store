import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PrivateRoute from './components/auth/PrivateRoute'
import AdminLayout from './components/layout/AdminLayout'
import Layout from './components/layout/Layout'
import AdminBooksPage from './pages/AdminBooksPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AccountPage from './pages/AccountPage'
import BookDetailPage from './pages/BookDetailPage'
import AdminPortalPage from './pages/AdminPortalPage'
import BooksPage from './pages/BooksPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import RegisterPage from './pages/RegisterPage'
import WishlistPage from './pages/WishlistPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<HomePage />} index />
          <Route element={<BooksPage />} path="books" />
          <Route element={<BookDetailPage />} path="books/:bookId" />
          <Route element={<CartPage />} path="cart" />
          <Route element={<LoginPage />} path="login" />
          <Route element={<RegisterPage />} path="register" />
          <Route
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
            path="account"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <WishlistPage />
              </PrivateRoute>
            }
            path="wishlist"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <CheckoutPage />
              </PrivateRoute>
            }
            path="checkout"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <OrderHistoryPage />
              </PrivateRoute>
            }
            path="orders"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <OrderConfirmationPage />
              </PrivateRoute>
            }
            path="orders/:orderId/confirmation"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['CUSTOMER']}>
                <OrderDetailPage />
              </PrivateRoute>
            }
            path="orders/:orderId"
          />
        </Route>
        <Route
          element={
            <PrivateRoute allowedRoles={['SALES_MANAGER', 'PRODUCT_MANAGER']}>
              <AdminLayout />
            </PrivateRoute>
          }
          path="admin"
        >
          <Route element={<AdminPortalPage />} index />
          <Route
            element={
              <PrivateRoute allowedRoles={['PRODUCT_MANAGER']}>
                <AdminBooksPage />
              </PrivateRoute>
            }
            path="books"
          />
          <Route
            element={
              <PrivateRoute allowedRoles={['PRODUCT_MANAGER']}>
                <AdminCategoriesPage />
              </PrivateRoute>
            }
            path="categories"
          />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
