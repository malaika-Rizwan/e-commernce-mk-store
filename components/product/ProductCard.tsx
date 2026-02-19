'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  /** Image URL string, or object with url (from API). */
  image: string | { url?: string };
  /** When provided, links to /product/[slug] (MongoDB). Otherwise /products/[id]. */
  slug?: string;
  /** When provided, shows heart wishlist toggle (e.g. on home and product grids). */
  showWishlist?: boolean;
}

function toImageUrl(v: string | { url?: string } | undefined): string {
  if (v == null) return '';
  return typeof v === 'string' ? v : (v?.url ?? '');
}

export function ProductCard({
  id,
  name,
  price,
  image,
  slug,
  showWishlist = false,
}: ProductCardProps) {
  const href = slug ? `/product/${slug}` : `/products/${id}`;
  const imageUrl = toImageUrl(image);
  const isLocal =
    typeof imageUrl === 'string' && imageUrl.length > 0 && imageUrl.startsWith('/') && !imageUrl.startsWith('http');
  const formattedPrice = new Intl.NumberFormat('en-PK').format(price);

  const showImage = imageUrl.trim() || undefined;

  return (
    <article className="group flex h-[420px] w-full flex-col overflow-hidden rounded-xl bg-cardBg shadow-soft transition duration-300 hover:shadow-card-hover">
      <Link href={href} className="relative h-56 w-full overflow-hidden bg-cardBg">
        {showWishlist && (
          <div className="absolute right-3 top-3 z-10" onClick={(e) => e.preventDefault()}>
            <WishlistButton productId={id} size="sm" ariaLabel={undefined} />
          </div>
        )}
        {showImage ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={!!isLocal}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-darkBase/40 text-sm">No image</div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-darkBase">
          {name}
        </h3>
        <p className="mt-2 text-lg font-bold text-darkBase">Rs {formattedPrice}</p>

        <div className="mt-auto pt-4">
          <Link href={href} className="block">
            <Button
              variant="primary"
              size="md"
              fullWidth
              className="rounded-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              View Product
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
