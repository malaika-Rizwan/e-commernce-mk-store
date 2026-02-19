'use client';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  value = 0,
  onChange,
}: RatingStarsProps) {
  const sizeClass = sizeClasses[size];

  if (interactive && onChange) {
    return (
      <div className="flex gap-0.5" role="group" aria-label="Rate from 1 to 5 stars">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onChange(star);
            }}
            className={`focus:outline-none focus:ring-2 focus:ring-primaryAccent focus:ring-offset-1 rounded ${sizeClass}`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={value === star}
          >
            <Star filled={star <= value} className={sizeClass} />
          </button>
        ))}
      </div>
    );
  }

  const rounded = Math.round(rating);
  const full = Math.min(rounded, max);
  const empty = max - full;

  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${rating.toFixed(1)} out of ${max}`}>
      {Array.from({ length: full }, (_, i) => (
        <Star key={`f-${i}`} filled className={sizeClass} />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <Star key={`e-${i}`} filled={false} className={sizeClass} />
      ))}
    </div>
  );
}

function Star({
  filled,
  className,
}: {
  filled?: boolean;
  half?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-block ${filled ? 'text-primaryAccent' : 'text-gray-300 dark:text-gray-600'} ${className ?? ''}`}
      aria-hidden="true"
    >
      <StarSvg filled={filled ?? false} />
    </span>
  );
}

function StarSvg({ filled }: { filled: boolean }) {
  return (
    <svg
      className="block"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}
