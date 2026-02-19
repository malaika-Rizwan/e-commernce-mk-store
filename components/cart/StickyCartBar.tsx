'use client';

import Link from 'next/link';
import { useCartItemCount } from '@/store/hooks';

export function StickyCartBar() {
  const count = useCartItemCount();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-slide-up">
      <Link
        href="/cart"
        className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white px-6 py-3.5 shadow-soft-lg transition hover:shadow-card-hover"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primaryAccent text-lg font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
        <span className="font-semibold text-darkBase">
          {count} {count === 1 ? 'item' : 'items'} in cart
        </span>
        <span className="text-sm font-medium text-primaryAccent">View cart →</span>
      </Link>
    </div>
  );
}
