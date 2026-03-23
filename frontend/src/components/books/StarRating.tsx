import { Star } from '@phosphor-icons/react'

interface StarRatingProps {
  value: number
  reviewCount?: number
  className?: string
  iconClassName?: string
  showText?: boolean
}

function StarRating({
  value,
  reviewCount,
  className,
  iconClassName,
  showText = true,
}: StarRatingProps) {
  const clampedValue = Math.max(0, Math.min(5, value))
  const fullStars = Math.floor(clampedValue)
  const hasHalfStar = clampedValue - fullStars >= 0.5

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`.trim()}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const isFilled = index < fullStars
          const isHalfFilled = !isFilled && hasHalfStar && index === fullStars

          return (
            <span className="relative inline-flex" key={index}>
              <Star className={`text-gold-500/30 ${iconClassName ?? 'text-base'}`.trim()} />
              {isFilled || isHalfFilled ? (
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: isFilled ? '100%' : '50%' }}
                >
                  <Star
                    className={`text-gold-500 ${iconClassName ?? 'text-base'}`.trim()}
                    weight="fill"
                  />
                </span>
              ) : null}
            </span>
          )
        })}
      </div>

      {showText ? (
        <span className="text-sm text-ink-500">
          {reviewCount && reviewCount > 0
            ? `${clampedValue.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
            : 'Awaiting reviews'}
        </span>
      ) : null}
    </div>
  )
}

export default StarRating
