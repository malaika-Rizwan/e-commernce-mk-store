'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm';
import { AdminBackButton } from '@/components/admin/AdminBackButton';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<string[]>([]);
  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products/categories', { credentials: 'include' }).then((r) => r.json()),
      fetch(`/api/admin/products/${id}`, { credentials: 'include' }).then((r) => r.json()),
    ]).then(([catRes, prodRes]) => {
      if (catRes.success && Array.isArray(catRes.data?.categories)) {
        setCategories(catRes.data.categories);
      }
      if (prodRes.success && prodRes.data) {
        const p = prodRes.data;
        setInitialData({
          name: p.name ?? '',
          description: p.description ?? '',
          price: String(p.price ?? ''),
          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
          category: p.category ?? '',
          stock: String(p.stock ?? 0),
          featured: Boolean(p.featured),
          images: p.images ?? [],
        });
      } else {
        setInitialData(null);
      }
    }).catch(() => setInitialData(null))
    .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : undefined,
        category: data.category.trim(),
        stock: parseInt(data.stock, 10) || 0,
        featured: data.featured,
        images: data.images,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? 'Failed to update product');
    router.push('/admin/products');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div>
        <AdminBackButton />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Product not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton />
      </div>
      <div className="max-w-2xl">
        <ProductForm
          initialData={initialData}
          categories={categories}
          submitLabel="Update product"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
