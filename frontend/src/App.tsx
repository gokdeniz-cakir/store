import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PrivateRoute from './components/auth/PrivateRoute'
import Layout from './components/layout/Layout'
import AccountPage from './pages/AccountPage'
import BookDetailPage from './pages/BookDetailPage'
import AdminPortalPage from './pages/AdminPortalPage'
import BooksPage from './pages/BooksPage'
import CartPage from './pages/CartPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

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
              <PrivateRoute allowedRoles={['SALES_MANAGER', 'PRODUCT_MANAGER']}>
                <AdminPortalPage />
              </PrivateRoute>
            }
            path="admin"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
