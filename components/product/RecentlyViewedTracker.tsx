'use client';

import { useEffect } from 'react';
import { addRecentlyViewed } from '@/lib/recently-viewed';

interface RecentlyViewedTrackerProps {
  product: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    images?: string[] | { url: string; public_id?: string }[];
  };
}

export function RecentlyViewedTracker({ product }: RecentlyViewedTrackerProps) {
  useEffect(() => {
    addRecentlyViewed({
      id: String(product._id),
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url,
    });
  }, [product._id, product.slug, product.name, product.price, product.images]);

  return null;
}
