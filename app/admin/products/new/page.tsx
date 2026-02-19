'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm';
import { AdminBackButton } from '@/components/admin/AdminBackButton';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/products/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data?.categories)) {
          setCategories(d.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
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
    if (!res.ok) throw new Error(result.error ?? 'Failed to create product');
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <AdminBackButton />
      </div>
      <div className="max-w-2xl">
        <ProductForm
          categories={categories}
          submitLabel="Create product"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
