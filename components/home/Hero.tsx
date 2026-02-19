'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 p-8 sm:p-12 md:p-16 lg:p-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,transparent_50%)]" />
      <div className="relative z-10 max-w-2xl animate-fade-in">
        <p className="text-sm font-medium uppercase tracking-widest text-white/90">
          Premium E-Commerce
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          Curated products, seamless checkout.
        </h1>
        <p className="mt-6 text-lg text-white/90">
          Discover quality items with secure Stripe payments. Fast shipping and easy returns.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-600 shadow-soft-lg transition hover:bg-white/95"
          >
            Shop now
          </Link>
          <Link
            href="/products?featured=true"
            className="inline-flex items-center rounded-xl border-2 border-white/50 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Featured
          </Link>
        </div>
      </div>
    </section>
  );
}
