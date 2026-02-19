'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';

interface StickyAddToCartProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export function StickyAddToCart({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: StickyAddToCartProps) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const threshold = 400;
    function onScroll() {
      setVisible(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const fn = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  if (!visible || stock <= 0 || !isDesktop) return null;

  const maxQty = Math.min(99, stock);

  function handleAdd() {
    dispatch(
      addItem({
        productId,
        slug,
        name,
        price,
        quantity: qty,
        image,
      })
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-darkBase/20 bg-cardBg/95 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-cardBg/90 lg:py-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4">
        <p className="truncate text-sm font-semibold text-darkBase md:max-w-xs">{name}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-darkBase/20 bg-pageBg/80">
            <button
              type="button"
              onClick={() => setQty((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center text-darkBase hover:bg-darkBase/10"
              aria-label="Decrease quantity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-darkBase">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((p) => Math.min(maxQty, p + 1))}
              className="flex h-9 w-9 items-center justify-center text-darkBase hover:bg-darkBase/10"
              aria-label="Increase quantity"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-[#EBBB69] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e0ae55]"
          >
            Add to Cart — ${(price * qty).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
