'use client';

import { useState } from 'react';
import { RatingStars } from '@/components/review/RatingStars';
import { ReviewForm } from '@/components/review/ReviewForm';

interface Review {
  _id?: string;
  user?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetailsTabsProps {
  description: string;
  features: string[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  productSlug: string;
  productId: string;
  isLoggedIn: boolean;
  onReviewAdded?: () => void;
}

const TABS = ['Description', 'Features', 'Reviews', 'Shipping Info'] as const;

function getRatingBreakdown(reviews: Review[]) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    counts[idx]++;
  });
  const total = reviews.length;
  return counts.map((c, i) => ({ stars: 5 - i, count: c, pct: total ? (c / total) * 100 : 0 }));
}

export function ProductDetailsTabs({
  description,
  features,
  reviews,
  averageRating,
  reviewCount,
  productSlug,
  productId,
  isLoggedIn,
  onReviewAdded,
}: ProductDetailsTabsProps) {
  const [active, setActive] = useState<(typeof TABS)[number]>('Description');
  const breakdown = getRatingBreakdown(reviews);
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mt-12">
      <nav className="flex flex-wrap gap-6 border-b border-darkBase/20">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`relative pb-3 text-sm font-medium transition focus:outline-none ${
              active === tab ? 'text-darkBase' : 'text-darkBase/60 hover:text-darkBase'
            }`}
          >
            {tab}
            {active === tab && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryAccent"
                style={{ backgroundColor: '#EBBB69' }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-6 min-h-[200px]">
        {active === 'Description' && (
          <div className="prose prose-neutral max-w-none text-darkBase/90">
            <p className="whitespace-pre-wrap leading-relaxed">{description || 'No description.'}</p>
          </div>
        )}

        {active === 'Features' && (
          <ul className="space-y-3">
            {features.length > 0 ? (
              features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-darkBase/90">
                  <span className="mt-0.5 text-primaryAccent" aria-hidden>
                    <CheckIcon />
                  </span>
                  <span>{f}</span>
                </li>
              ))
            ) : (
              <li className="text-darkBase/60">No features listed.</li>
            )}
          </ul>
        )}

        {active === 'Reviews' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <RatingStars rating={averageRating} size="lg" />
              <span className="text-lg font-semibold text-darkBase">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </span>
              {reviewCount > 0 && (
                <span className="text-sm text-darkBase/60">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              )}
            </div>

            {reviewCount > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-darkBase/80">Rating breakdown</p>
                <div className="space-y-2">
                  {breakdown
                    .filter((r) => r.count > 0)
                    .map((r) => (
                      <div key={r.stars} className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-sm text-darkBase/80">
                          {r.stars} <StarIcon className="h-4 w-4 text-primaryAccent" />
                        </span>
                        <div className="h-2 flex-1 max-w-[200px] overflow-hidden rounded-full bg-darkBase/10">
                          <div
                            className="h-full rounded-full bg-primaryAccent"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-darkBase/60">{r.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {isLoggedIn && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-darkBase">Write a review</h3>
                <ReviewForm productSlug={productSlug} onSuccess={onReviewAdded} />
              </div>
            )}

            {sortedReviews.length > 0 ? (
              <ul className="space-y-4">
                {sortedReviews.map((review) => (
                  <li
                    key={review._id ?? String(review.createdAt)}
                    className="rounded-xl border border-darkBase/10 bg-cardBg/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="text-sm text-darkBase/60">
                        {review.userName ?? 'Customer'} ·{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-darkBase/90">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-darkBase/60">
                {isLoggedIn
                  ? 'No reviews yet. Be the first to review.'
                  : 'Sign in to leave a review.'}
              </p>
            )}
          </div>
        )}

        {active === 'Shipping Info' && (
          <div className="space-y-6 text-darkBase/90">
            <div>
              <h3 className="text-sm font-semibold text-darkBase">Delivery</h3>
              <p className="mt-1 text-sm">
                Estimated delivery: 3–7 business days. Free shipping on orders over $50.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-darkBase">Returns</h3>
              <p className="mt-1 text-sm">
                30-day return policy. Items must be unused and in original packaging.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-darkBase">Secure payment</h3>
              <p className="mt-1 text-sm">
                We use encrypted checkout. Your payment information is secure.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
