'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProductDisplayImages } from '@/lib/placeholderImages';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  fallbackIndex?: number;
}

export function ProductImageGallery({ images, name, fallbackIndex = 0 }: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const displayImages = getProductDisplayImages(images, fallbackIndex);
  const current = displayImages[selected];

  if (!displayImages.length) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted transition-transform duration-300 hover:scale-[1.02]">
        <Image
          src={current}
          alt={name}
          fill
          className="object-cover"
          priority
          unoptimized={current.includes('cloudinary')}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition hover:scale-[1.02] ${
                i === selected
                  ? 'border-primaryAccent ring-2 ring-primaryAccent/20'
                  : 'border-border hover:border-primaryAccent/50'
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                unoptimized={url.includes('cloudinary')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
