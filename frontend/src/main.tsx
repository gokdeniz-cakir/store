import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { CartProvider } from './context/CartContext.tsx'
import { NotificationProvider } from './context/NotificationContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { WishlistProvider } from './context/WishlistContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
