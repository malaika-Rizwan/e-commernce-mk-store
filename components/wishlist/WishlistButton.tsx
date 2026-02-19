'use client';

import { useWishlistIds } from '@/hooks/useWishlist';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

export function WishlistButton({
  productId,
  className = '',
  size = 'md',
  ariaLabel,
}: WishlistButtonProps) {
  const { ids, loading, toggle } = useWishlistIds();
  const isInWishlist = ids.has(productId);
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    await toggle(productId);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full border border-white/40 bg-white/90 shadow-soft transition hover:border-primaryAccent hover:bg-primaryAccent hover:text-white focus:outline-none focus:ring-2 focus:ring-primaryAccent focus:ring-offset-2 disabled:opacity-50 ${isInWishlist ? 'text-primaryAccent' : 'text-darkBase'} ${sizeClass} ${className}`}
      aria-label={ariaLabel ?? (isInWishlist ? 'Remove from wishlist' : 'Add to wishlist')}
      disabled={loading}
    >
      {isInWishlist ? (
        <svg className="h-5 w-5 text-primaryAccent" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}
