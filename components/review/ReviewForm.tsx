'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RatingStars } from './RatingStars';

interface ReviewFormProps {
  productSlug: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productSlug, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit review');
        return;
      }
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Your rating
        </p>
        <RatingStars
          rating={0}
          interactive
          value={rating}
          onChange={setRating}
          size="lg"
        />
      </div>
      <div>
        <label
          htmlFor="review-comment"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your experience with this product..."
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {comment.length}/1000
        </p>
      </div>
      <Button type="submit" disabled={loading} isLoading={loading}>
        Submit review
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Only verified buyers can leave a review. You must have purchased this
        product.
      </p>
    </form>
  );
}
