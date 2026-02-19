'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdminBackButton } from '@/components/admin/AdminBackButton';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  stock: number;
  images: string[] | { url: string; public_id?: string }[];
  featured?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.data?.products) {
        setProducts(data.data.products);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function confirmDelete() {
    if (!deleteModal) return;
    const id = deleteModal.id;
    setDeleteModal(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(data.error ?? 'Failed to delete');
      }
    } catch {
      alert('Network error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSeedProducts() {
    if (!confirm('Add 6 sample products (p1.jpg–p6.jpg) to the store? Existing products with the same SKUs will be replaced.')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-products', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        alert(data.data?.message ?? 'Products added.');
      } else {
        alert(data.error ?? 'Failed to seed products');
      }
    } catch {
      alert('Network error');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <AdminBackButton />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedProducts}
            disabled={seeding}
            className="text-sm"
          >
            {seeding ? 'Adding…' : 'Add sample products (p1–p6)'}
          </Button>
          <Link href="/admin/products/new">
            <Button variant="primary">Add product</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No products yet.</p>
          <Link href="/admin/products/new" className="mt-4 inline-block">
            <Button variant="primary">Add your first product</Button>
          </Link>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                          {(() => {
                            const firstUrl = typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url;
                            return firstUrl ? (
                              <Image
                                src={firstUrl}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized={!firstUrl.includes('cloudinary')}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                No img
                              </div>
                            );
                          })()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {p.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                      ${p.price.toFixed(2)}
                      {p.compareAtPrice != null && p.compareAtPrice > p.price && (
                        <span className="ml-1 text-gray-500 line-through">
                          ${p.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {p.stock}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${p._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteModal({ id: p._id, name: p.name })}
                          disabled={deletingId === p._id}
                          isLoading={deletingId === p._id}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete product?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              &ldquo;{deleteModal.name}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteModal(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
