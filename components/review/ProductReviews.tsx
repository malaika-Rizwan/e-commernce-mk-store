'use client';

import { RatingStars } from './RatingStars';
import { ReviewForm } from './ReviewForm';

interface Review {
  _id?: string;
  user?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productSlug: string;
  productId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  isLoggedIn: boolean;
  onReviewAdded?: () => void;
}

export function ProductReviews({
  productSlug,
  reviews = [],
  averageRating = 0,
  reviewCount = 0,
  isLoggedIn,
  onReviewAdded,
}: ProductReviewsProps) {
  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Customer reviews
      </h2>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <RatingStars rating={averageRating} size="lg" />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </span>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Write a review
          </h3>
          <ReviewForm productSlug={productSlug} onSuccess={onReviewAdded} />
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-8 space-y-6">
          {reviews
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((review) => (
              <li
                key={review._id ?? String(review.createdAt)}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {review.userName ?? 'Customer'} ·{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>
              </li>
            ))}
        </ul>
      )}

      {reviews.length === 0 && !isLoggedIn && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          No reviews yet. Purchase this product and sign in to leave the first
          review.
        </p>
      )}

      {reviews.length === 0 && isLoggedIn && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          No reviews yet. Be the first to review (verified buyers only).
        </p>
      )}
    </div>
  );
}
