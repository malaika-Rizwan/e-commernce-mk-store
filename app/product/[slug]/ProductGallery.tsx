'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProductDisplayImages } from '@/lib/placeholderImages';

interface ProductGalleryProps {
  images: string[] | { url: string; public_id?: string }[];
  name: string;
  fallbackIndex?: number;
}

export function ProductGallery({ images, name, fallbackIndex = 0 }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const displayImages = getProductDisplayImages(images, fallbackIndex);
  const current = displayImages[selected];
  const thumbnails = displayImages.slice(0, 8);

  if (!displayImages.length) {
    return (
      <div
        className="flex aspect-square w-full max-w-full items-center justify-center rounded-2xl bg-[#E6E2DE] text-[#49474D]/70 shadow-md"
        style={{ minHeight: 320 }}
      >
        No image
      </div>
    );
  }

  const isCloudinary = (url: string) => url.includes('cloudinary');

  return (
    <div className="flex flex-col">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-[#E6E2DE] shadow-md"
        style={{ aspectRatio: '1', minHeight: 320 }}
      >
        {displayImages.map((url, i) => (
          <div
            key={url}
            className="absolute inset-0 transition-opacity duration-300 ease-out"
            style={{
              opacity: i === selected ? 1 : 0,
              zIndex: i === selected ? 1 : 0,
            }}
            aria-hidden={i !== selected}
          >
            <div className="group relative h-full w-full overflow-hidden rounded-2xl">
              <Image
                src={url}
                alt={i === selected ? name : ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority={i === 0}
                unoptimized={!isCloudinary(url)}
              />
            </div>
          </div>
        ))}
      </div>

      {thumbnails.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 md:h-20 md:w-20 ${
                i === selected
                  ? 'border-[#EBBB69] ring-2 ring-[#EBBB69]/30'
                  : 'border-[#E6E2DE] bg-[#E6E2DE] hover:scale-105 hover:border-[#49474D]/30'
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
                unoptimized={!isCloudinary(url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
