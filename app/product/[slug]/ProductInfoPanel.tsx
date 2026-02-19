'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { RatingStars } from '@/components/review/RatingStars';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductInfoPanelProps {
  productId: string;
  slug: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  shortDescription?: string;
  image?: string;
  averageRating: number;
  reviewCount: number;
}

function getStockStatus(stock: number): { label: string; className: string } {
  if (stock <= 0) return { label: 'Out of stock', className: 'text-red-600' };
  if (stock <= 5) return { label: `Only ${stock} left`, className: 'text-amber-600' };
  return { label: 'In stock', className: 'text-green-700' };
}

export function ProductInfoPanel({
  productId,
  slug,
  name,
  brand,
  category,
  price,
  compareAtPrice,
  stock,
  shortDescription,
  image,
  averageRating,
  reviewCount,
}: ProductInfoPanelProps) {
  const dispatch = useAppDispatch();
  const maxQty = Math.max(1, Math.min(99, stock || 0));
  const [qty, setQty] = useState(1);

  const discountPrice = compareAtPrice != null && compareAtPrice > price ? price : null;
  const displayPrice = discountPrice ?? price;
  const percentSaved =
    compareAtPrice != null && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const stockStatus = getStockStatus(stock);

  function handleAddToCart() {
    dispatch(
      addItem({
        productId,
        slug,
        name,
        price,
        quantity: qty,
        image,
      })
    );
  }

  function handleBuyNow() {
    dispatch(
      addItem({
        productId,
        slug,
        name,
        price,
        quantity: qty,
        image,
      })
    );
    window.location.href = '/cart';
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-darkBase md:text-3xl">{name}</h1>

      {brand && (
        <p className="mt-1 text-sm text-[#49474D]/70">
          Brand: <span className="font-medium text-darkBase">{brand}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RatingStars rating={averageRating} size="md" />
        <span className="text-sm text-darkBase/80">
          {averageRating > 0 ? averageRating.toFixed(1) : '—'}
        </span>
        {reviewCount > 0 && (
          <span className="text-sm text-darkBase/60">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span
          className={`text-2xl font-bold ${discountPrice ? 'text-primaryAccent' : 'text-darkBase'}`}
        >
          ${displayPrice.toFixed(2)}
        </span>
        {compareAtPrice != null && compareAtPrice > price && (
          <>
            <span className="text-lg text-darkBase/50 line-through">
              ${compareAtPrice.toFixed(2)}
            </span>
            {percentSaved != null && (
              <span className="text-sm font-medium text-primaryAccent">
                Save {percentSaved}%
              </span>
            )}
          </>
        )}
      </div>

      <p className={`mt-3 text-sm font-medium ${stockStatus.className}`}>
        {stockStatus.label}
      </p>

      {shortDescription && (
        <p className="mt-4 text-sm leading-relaxed text-darkBase/80 line-clamp-3">
          {shortDescription}
        </p>
      )}

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-darkBase/70">Quantity</label>
        <div className="flex w-fit items-center overflow-hidden rounded-xl border border-darkBase/20 bg-cardBg/80">
          <button
            type="button"
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            disabled={stock <= 0 || qty <= 1}
            className="flex h-11 w-11 items-center justify-center text-darkBase transition hover:bg-darkBase/10 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) setQty(Math.max(1, Math.min(maxQty, v)));
            }}
            className="h-11 w-14 border-x border-darkBase/20 bg-transparent text-center text-sm font-medium text-darkBase focus:outline-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQty((prev) => Math.min(maxQty, prev + 1))}
            disabled={stock <= 0 || qty >= maxQty}
            className="flex h-11 w-11 items-center justify-center text-darkBase transition hover:bg-darkBase/10 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="flex w-full items-center justify-center rounded-xl bg-[#EBBB69] py-3.5 font-semibold text-white shadow-soft transition hover:scale-[1.02] hover:bg-[#e0ae55] disabled:opacity-50 disabled:hover:scale-100"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={stock <= 0}
          className="flex w-full items-center justify-center rounded-xl bg-darkBase py-3.5 font-semibold text-white transition hover:bg-darkBase/90 disabled:opacity-50"
        >
          Buy Now
        </button>
        <div className="flex items-center gap-3">
          <WishlistButton
            productId={productId}
            size="md"
            className="!rounded-xl !border-primaryAccent !bg-transparent !h-11 !w-11 border-2"
            ariaLabel="Add to wishlist"
          />
          <span className="text-sm text-darkBase/70">Add to Wishlist</span>
        </div>
      </div>
    </div>
  );
}
