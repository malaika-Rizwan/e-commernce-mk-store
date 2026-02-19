'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductsClient } from '@/app/products/ProductsClient';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function ProductsSection() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('q') != null) {
      const el = document.getElementById('products');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  return (
    <section
      id="products"
      className="min-h-screen bg-pageBg"
      style={{ backgroundColor: '#BEB9B4' }}
      aria-labelledby="products-heading"
    >
      <ScrollReveal className="container mx-auto max-w-[1200px] px-4 py-20">
        <ProductsClient />
      </ScrollReveal>
    </section>
  );
}
