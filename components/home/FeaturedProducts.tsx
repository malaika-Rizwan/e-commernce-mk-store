'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FEATURED_PRODUCTS } from '@/data/featuredProducts';

export function FeaturedProducts() {
  return (
    <section className="mt-14 sm:mt-18">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold text-darkBase sm:text-3xl">
          Featured products
        </h2>
        <Link
          href="/products"
          className="text-sm font-medium text-darkBase transition hover:text-primaryAccent"
        >
          View all products →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURED_PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-white/60 bg-white shadow-soft transition duration-300 hover:scale-[1.03] hover:shadow-card-hover"
          >
            <Link href="/products" className="block">
              <div className="relative aspect-square overflow-hidden bg-cardBg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <span className="absolute left-3 top-3 rounded-lg bg-primaryAccent px-2 py-1 text-xs font-medium text-white shadow-soft">
                  {product.category}
                </span>
              </div>
            </Link>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.category}
              </p>
              <h3 className="mt-1 font-semibold text-darkBase">
                <Link href="/products" className="transition hover:text-primaryAccent">
                  {product.name}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {product.details.slice(0, 3).map((detail, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-darkBase/50" aria-hidden />
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-lg font-bold text-darkBase">
                ${product.price}
              </p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium text-primaryAccent transition hover:underline"
              >
                View details →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
