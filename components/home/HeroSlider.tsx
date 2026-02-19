'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const BANNERS = [
  { src: '/banner1.jpg', alt: 'Premium collection' },
  { src: '/banner2.jpg', alt: 'New arrivals' },
  { src: '/banner3.jpg', alt: 'Shop the look' },
];

const ROTATE_MS = 5000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const { scrollY } = useScroll();
  const bgScale = useTransform(scrollY, [0, 400], [1, 1.05]);
  const textY = useTransform(scrollY, [0, 300], [0, -30]);
  const textOpacity = useTransform(scrollY, [0, 200], [1, 0.3]);

  const goTo = useCallback((i: number) => {
    setIndex((i + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % BANNERS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <div className="relative aspect-[21/9] min-h-[200px] w-full sm:min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
        {BANNERS.map((banner, i) => (
          <motion.div
            key={banner.src}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{
              opacity: i === index ? 1 : 0,
              zIndex: i === index ? 1 : 0,
              scale: i === index ? bgScale : 1,
            }}
            aria-hidden={i !== index}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>
        ))}

        <motion.div
          className="absolute inset-0 z-10 flex items-center"
          style={{ y: textY, opacity: textOpacity }}
        >
          <div className="max-w-2xl px-6 py-8 sm:px-10 sm:py-12 md:px-14">
            <motion.p
              className="text-sm font-medium uppercase tracking-[0.2em] text-white/90 drop-shadow-sm"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Premium E-Commerce
            </motion.p>
            <motion.h1
              className="mt-3 text-4xl font-bold leading-tight text-white drop-shadow-md sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Curated products, seamless checkout.
            </motion.h1>
            <motion.p
              className="mt-5 max-w-lg text-base text-white/90 drop-shadow-sm sm:text-lg md:text-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Discover quality items with secure Stripe payments.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <Link
                href="/products"
                className="inline-flex items-center rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:px-8 sm:py-4 sm:text-lg"
                style={{ backgroundColor: '#EBBB69' }}
              >
                Shop now
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center rounded-xl border-2 border-white/70 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5 sm:px-8 sm:py-4 sm:text-lg"
              >
                Explore Products
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-4"
          aria-label="Previous slide"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-4"
          aria-label="Next slide"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{
                width: i === index ? 24 : 8,
                backgroundColor: i === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
              }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
