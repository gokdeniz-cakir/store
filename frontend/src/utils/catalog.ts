import {
  Bank,
  BookOpenText,
  Bookmarks,
  MagnifyingGlass,
  RocketLaunch,
  Scroll,
} from '@phosphor-icons/react'
import { createElement, type ComponentType } from 'react'

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  Bank,
  Bookmarks,
  BookOpen: BookOpenText,
  MagnifyingGlass,
  RocketLaunch,
  Scroll,
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function getCategoryIcon(iconName?: string) {
  if (!iconName) {
    return BookOpenText
  }

  return categoryIcons[iconName] ?? BookOpenText
}

export function renderCategoryIcon(iconName: string | undefined, className?: string) {
  return createElement(getCategoryIcon(iconName), { className })
}

export function getCoverPresentation(coverColor: string) {
  const normalized = coverColor.replace('#', '')

  if (normalized.length !== 6) {
    return {
      borderClassName: 'border-white/20',
      iconClassName: 'text-white/70',
      textClassName: 'text-white',
    }
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255

  if (luminance > 0.68) {
    return {
      borderClassName: 'border-ink-900/10',
      iconClassName: 'text-ink-900/55',
      textClassName: 'text-ink-900',
    }
  }

  if (luminance > 0.45) {
    return {
      borderClassName: 'border-ink-900/20',
      iconClassName: 'text-ink-900/65',
      textClassName: 'text-ink-900',
    }
  }

  return {
    borderClassName: 'border-white/20',
    iconClassName: 'text-gold-500/80',
    textClassName: 'text-white',
  }
}

export function truncateText(value: string | null, maxLength: number) {
  if (!value) {
    return ''
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trimEnd()}...`
}
