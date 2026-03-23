import {
  CaretDown,
  FacebookLogo,
  Heart,
  InstagramLogo,
  MagnifyingGlass,
  Tote,
  User,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react'
import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

const primaryNavLinks = [
  { href: '/#hero', label: 'Limited Editions' },
  { label: 'Catalogue', to: '/books' },
  { label: 'New Releases', to: '/books?sort=createdAt,desc' },
  { label: 'Collections', to: '/books' },
  { label: 'Fiction', to: '/books?category=Fiction' },
  { label: 'Non-Fiction', to: '/books?category=Non-Fiction' },
  { href: '/#atelier', label: 'Gifts' },
] as const

const exploreLinks = [
  { href: '/books?sort=createdAt,desc', label: 'New Releases' },
  { href: '/books', label: 'Curated Libraries' },
  { href: '/books', label: 'Browse Catalogue' },
  { href: '/books?category=Classic%20Literature', label: 'Editor’s Choice' },
  { href: '/#atelier', label: 'Gift Services' },
] as const

const supportLinks = [
  { href: '/#atelier', label: 'Customer Service' },
  { href: '/#atelier', label: 'Delivery & Returns' },
  { href: '/#atelier', label: 'FAQs' },
  { href: '/#atelier', label: 'Contact Aurelia' },
  { href: '/design-reference.html', label: 'Design Reference' },
] as const

const legalLinks = [
  { href: '/#atelier', label: 'Privacy Policy' },
  { href: '/#atelier', label: 'Terms & Conditions' },
  { href: '/#atelier', label: 'Cookie Policy' },
] as const

const socialLinks = [
  { href: '/#atelier', icon: InstagramLogo, label: 'Instagram' },
  { href: '/#atelier', icon: XLogo, label: 'X' },
  { href: '/#atelier', icon: FacebookLogo, label: 'Facebook' },
  { href: '/#atelier', icon: YoutubeLogo, label: 'YouTube' },
] as const

const cartItemCount = 2

function Layout() {
  const currentYear = new Date().getFullYear()
  const { isAuthenticated, user } = useAuth()
  const accountHref = isAuthenticated ? '/account' : '/login'

  return (
    <div className="flex min-h-screen flex-col bg-parchment-50 text-ink-900">
      <div className="bg-ink-900 px-4 py-2.5 text-center text-[11px] font-medium uppercase tracking-announcement text-white">
        Complimentary premium shipping on all international orders over $300
      </div>

      <header className="sticky top-0 z-50 border-b border-parchment-200 bg-parchment-50/95 backdrop-blur-sm">
        <div className="mx-auto max-w-content px-8 py-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-center lg:w-1/3 lg:justify-start">
              <button
                className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink-900"
                type="button"
              >
                USD $
                <CaretDown className="text-sm" />
              </button>
            </div>

            <div className="text-center lg:w-1/3">
              <Link className="inline-block leading-none" to="/">
                <span className="block font-serif text-3xl tracking-tight text-ink-900 md:text-4xl">
                  AURELIA
                </span>
                <span className="mt-2 block text-sm uppercase tracking-[0.4em] text-ink-500">
                  Editions
                </span>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-ink-800 lg:w-1/3 lg:justify-end">
              <Link
                aria-label="Search the catalogue"
                className="transition-colors hover:text-crimson-700"
                to="/books"
              >
                <MagnifyingGlass className="text-2xl" />
              </Link>
              <Link
                aria-label={isAuthenticated ? 'View your account' : 'Sign in or register'}
                className="transition-colors hover:text-crimson-700"
                to={accountHref}
              >
                <User className="text-2xl" />
              </Link>
              <button
                aria-label="View your wishlist"
                className="transition-colors hover:text-crimson-700"
                type="button"
              >
                <Heart className="text-2xl" />
              </button>
              <button
                aria-label="View your cart"
                className="relative transition-colors hover:text-crimson-700"
                type="button"
              >
                <Tote className="text-2xl" />
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center bg-crimson-700 px-1 text-[9px] font-bold text-white">
                  {cartItemCount}
                </span>
              </button>
            </div>
          </div>

          <nav className="mt-6 border-t border-parchment-200 pt-5">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[12px] font-medium uppercase tracking-nav text-ink-800">
              {primaryNavLinks.map((link) => (
                <li key={link.label}>
                  {'to' in link ? (
                    <Link className="nav-link hover:text-crimson-700" to={link.to}>
                      {link.label}
                    </Link>
                  ) : (
                    <a className="nav-link hover:text-crimson-700" href={link.href}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              {user?.role !== 'CUSTOMER' ? (
                <li>
                  <Link className="nav-link hover:text-crimson-700" to="/admin">
                    Admin
                  </Link>
                </li>
              ) : null}
              <li>
                <Link className="nav-link hover:text-crimson-700" to={accountHref}>
                  {isAuthenticated ? 'Account' : 'Sign In'}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="border-t-4 border-crimson-700 bg-[#111111] pb-12 pt-24 text-slate-400">
        <div className="mx-auto mb-16 grid max-w-content grid-cols-1 gap-12 px-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 lg:pr-8">
            <Link className="inline-block leading-none" to="/">
              <span className="block font-serif text-2xl tracking-tight text-white">
                AURELIA
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.4em] text-slate-500">
                Editions
              </span>
            </Link>

            <p className="mt-6 text-sm font-light leading-7">
              Publishing the world’s greatest literature in beautiful, definitive
              editions. Every volume is treated as an object of craft.
            </p>

            <div className="mt-8 flex gap-5">
              {socialLinks.map((socialLink) => {
                const Icon = socialLink.icon

                return (
                  <a
                    aria-label={socialLink.label}
                    className="transition-colors hover:text-white"
                    href={socialLink.href}
                    key={socialLink.label}
                  >
                    <Icon className="text-2xl" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Explore
            </h2>
            <ul className="space-y-4 text-sm font-light">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a className="hover:text-gold-500" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Support
            </h2>
            <ul className="space-y-4 text-sm font-light">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a className="hover:text-gold-500" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              The Reading Room Newsletter
            </h2>
            <p className="text-sm font-light leading-7">
              Subscribe for new edition announcements, private offers, and notes from
              the Aurelia editorial desk.
            </p>

            <form
              className="mt-6 flex border-b border-slate-700 pb-2 transition-colors focus-within:border-white"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                className="w-full bg-transparent text-sm font-light text-white placeholder:text-slate-600 focus:outline-none"
                placeholder="Email Address"
                type="email"
              />
              <button
                className="pl-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:text-gold-500"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 border-t border-slate-800 px-8 pt-8 text-xs font-light md:flex-row">
          <p>© {currentYear} Aurelia Editions. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {legalLinks.map((link) => (
              <a className="hover:text-white" href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
