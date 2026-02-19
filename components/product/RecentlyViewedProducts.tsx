'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentlyViewed } from '@/lib/recently-viewed';

export function RecentlyViewedProducts() {
  const [items, setItems] = useState<ReturnType<typeof getRecentlyViewed>>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recently viewed
      </h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/product/${item.slug}`}
            className="flex w-36 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  unoptimized={item.image.includes('cloudinary')}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
