'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';

type SortValue = 'featured' | 'price-asc' | 'price-desc';

interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? '';

export function ProductsClient() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<SortValue>('featured');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fromUrl = searchParams.get('q') ?? '';
    setQ(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('limit', '100');
    if (searchParams.get('q')) params.set('q', searchParams.get('q')!);
    fetch(`${BASE}/api/products?${params}`, { next: { revalidate: 30 } })
      .then((res) => (res.ok ? res.json() : { data: { products: [] } }))
      .then((json) => {
        const list = json.data?.products ?? [];
        setProducts(list);
        const cats = Array.from(new Set(list.map((p: ApiProduct) => p.category).filter((c: string | undefined): c is string => Boolean(c)))).sort();
        setCategories(['All', ...(cats as string[])]);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = products.slice();

    if (category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    if (query) {
      list = list.filter((p) => {
        const hay = `${p.name} ${p.category ?? ''}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, q, category, sort]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 h-24 rounded-2xl bg-cardBg p-5 shadow-soft" />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-xl bg-cardBg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-cardBg p-5 shadow-soft sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-darkBase">All Products</h1>
          <p className="mt-1 text-sm text-darkBase/70">
            Browse our full catalog from the database. Search, filter, and sort.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-darkBase/20 bg-white px-4 py-2.5 text-sm text-darkBase placeholder:text-gray-400 transition focus:border-primaryAccent focus:outline-none focus:ring-2 focus:ring-primaryAccent/20"
            aria-label="Search products"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-darkBase/20 bg-white px-4 py-2.5 text-sm text-darkBase transition focus:border-primaryAccent focus:outline-none focus:ring-2 focus:ring-primaryAccent/20"
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="w-full rounded-xl border border-darkBase/20 bg-white px-4 py-2.5 text-sm text-darkBase transition focus:border-primaryAccent focus:outline-none focus:ring-2 focus:ring-primaryAccent/20"
            aria-label="Sort products"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/40 bg-cardBg/50 py-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 text-lg font-semibold text-darkBase">No products found</p>
          <p className="mt-2 text-sm text-darkBase/70">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p._id}
              id={p._id}
              name={p.name}
              price={p.price}
              image={p.images?.[0] ?? ''}
              slug={p.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
