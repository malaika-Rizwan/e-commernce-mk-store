'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const REVIEWS = [
  {
    name: 'Sarah M.',
    role: 'Verified Buyer',
    text: 'Fast shipping and exactly as described. Will order again.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&q=80',
  },
  {
    name: 'James K.',
    role: 'Verified Buyer',
    text: 'Premium quality and great customer service. Highly recommend.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&q=80',
  },
  {
    name: 'Emma L.',
    role: 'Verified Buyer',
    text: 'Smooth checkout and my order arrived in perfect condition.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&q=80',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="text-lg"
          style={{ color: i <= rating ? '#EBBB69' : '#49474D30' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="w-full py-20 sm:py-24"
      style={{ backgroundColor: '#BEB9B4' }}
      aria-labelledby="reviews-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal className="text-center">
          <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight text-[#49474D] sm:text-4xl md:text-5xl">
            Customer Reviews
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#49474D]/80">
            What our customers say about us.
          </p>
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full"
            style={{ backgroundColor: '#EBBB69' }}
            aria-hidden
          />
        </ScrollReveal>

        <ScrollReveal className="mt-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#E6E2DE]">
                    <Image
                      src={r.avatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[#49474D]">{r.name}</p>
                    <p className="text-xs text-[#49474D]/70">{r.role}</p>
                  </div>
                </div>
                <StarRating rating={r.rating} />
                <p className="mt-4 text-sm leading-relaxed text-[#49474D]/90">{r.text}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
