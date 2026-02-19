'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

const BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: (string | { url: string })[];
}

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 * i },
  }),
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

function getImageUrl(first: string | { url: string } | undefined): string {
  if (first == null) return '';
  return typeof first === 'string' ? first : first?.url ?? '';
}

function PremiumProductCard({ p, index }: { p: ApiProduct; index: number }) {
  const href = `/product/${p.slug}`;
  const imageUrl = getImageUrl(p.images?.[0]);
  const isLocal =
    typeof imageUrl === 'string' && imageUrl.length > 0 && imageUrl.startsWith('/') && !imageUrl.startsWith('http');

  return (
    <motion.article
      variants={item}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <Link href={href} className="relative block aspect-square w-full overflow-hidden bg-[#E6E2DE]">
        <div className="absolute right-3 top-3 z-10" onClick={(e) => e.preventDefault()}>
          <WishlistButton productId={p._id} size="sm" />
        </div>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={p.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized={!!isLocal}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#49474D]/40 text-sm">No image</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-[#49474D]/0 opacity-0 transition-all duration-300 group-hover:bg-[#49474D]/20 group-hover:opacity-100">
          <span
            className="rounded-xl px-5 py-2.5 font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
            style={{ backgroundColor: '#EBBB69' }}
          >
            View Product
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-[#49474D]">{p.name}</h3>
        <p className="mt-2 text-lg font-bold text-[#49474D]">
          Rs {new Intl.NumberFormat('en-PK').format(p.price)}
        </p>
      </div>
    </motion.article>
  );
}

export function FeaturedProductsLanding() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/products?limit=8`)
      .then((res) => (res.ok ? res.json() : { data: { products: [] } }))
      .then((json) => setProducts(json.data?.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="featured"
      className="w-full py-20 sm:py-24 md:py-28"
      style={{ backgroundColor: '#E6E2DE' }}
      aria-labelledby="featured-heading"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 id="featured-heading" className="text-3xl font-bold tracking-tight text-[#49474D] sm:text-4xl md:text-5xl">
              Featured Products
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#49474D]/80">
              Handpicked for quality and style.
            </p>
            <div
              className="mx-auto mt-6 h-1 w-16 rounded-full"
              style={{ backgroundColor: '#EBBB69' }}
              aria-hidden
            />
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-xl bg-white/60" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="mt-14 text-center text-[#49474D]/70">No products yet.</p>
        ) : (
          <motion.div
            className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {products.slice(0, 8).map((p, i) => (
              <PremiumProductCard key={p._id} p={p} index={i} />
            ))}
          </motion.div>
        )}

        <ScrollReveal className="mt-14 text-center">
          <Link
            href="/products"
            className="inline-flex items-center rounded-xl px-8 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: '#EBBB69' }}
          >
            View all products
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
