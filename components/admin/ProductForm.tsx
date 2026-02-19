'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import type { IProductImage } from '@/types';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  stock: string;
  featured: boolean;
  images: IProductImage[];
}

function toImageItem(url: string, public_id = ''): IProductImage {
  return { url, public_id };
}

function normalizeInitialImages(images: unknown): IProductImage[] {
  if (!Array.isArray(images)) return [];
  return images.map((item) => {
    if (typeof item === 'string') return toImageItem(item);
    if (item && typeof item === 'object' && 'url' in item) return toImageItem((item as IProductImage).url, (item as IProductImage).public_id);
    return null;
  }).filter((x): x is IProductImage => x != null);
}

const defaultForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  stock: '0',
  featured: false,
  images: [],
};

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories?: string[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
}

export function ProductForm({
  initialData,
  categories = [],
  onSubmit,
  submitLabel,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    ...defaultForm,
    ...initialData,
    images: normalizeInitialImages(initialData?.images ?? []),
    price: initialData?.price ?? '',
    compareAtPrice: initialData?.compareAtPrice ?? '',
    stock: initialData?.stock ?? '0',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewFiles, setPreviewFiles] = useState<{ file: File; objectUrl: string }[]>([]);

  useEffect(() => {
    return () => {
      previewFiles.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    };
  }, [previewFiles]);

  function removePreview(index: number) {
    setPreviewFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].objectUrl);
      return next;
    });
  }

  function addPreviews(files: FileList | null) {
    if (!files?.length) return;
    const list: { file: File; objectUrl: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      list.push({ file, objectUrl: URL.createObjectURL(file) });
    }
    setPreviewFiles((prev) => [...prev, ...list]);
  }

  async function uploadPreviews() {
    if (!previewFiles.length) return;
    setUploading(true);
    setError('');
    setUploadProgress(0);
    const formData = new FormData();
    formData.set('folder', 'mk-store/products');
    previewFiles.forEach((p) => formData.append('files', p.file));
    const total = previewFiles.length;
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      setUploadProgress(100);
      if (!res.ok) {
        setError(data.error ?? 'Upload failed');
        return;
      }
      const uploads = data.data?.uploads ?? [];
      if (uploads.length) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploads.map((u: { url: string; public_id?: string }) => toImageItem(u.url, u.public_id ?? ''))],
        }));
      }
      setPreviewFiles([]);
      previewFiles.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    addPreviews(files);
    e.target.value = '';
  }

  async function handleGenerateAiImage() {
    if (!form.name.trim()) {
      setError('Enter a product name to generate an image.');
      return;
    }
    setGeneratingAi(true);
    setError('');
    try {
      const res = await fetch('/api/admin/generate-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      const url = data.data?.url;
      if (url) setForm((prev) => ({ ...prev, images: [...prev.images, toImageItem(url)] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI image generation failed. Add OPENAI_API_KEY or upload manually.');
    } finally {
      setGeneratingAi(false);
    }
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        price: form.price.trim() || '0',
        compareAtPrice: form.compareAtPrice.trim() || '',
        stock: form.stock.trim() || '0',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isUploading = uploading || generatingAi;
  const canSubmit = !loading && !isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitLabel === 'Create product' ? 'New product' : 'Edit product'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          placeholder="Product name"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            required
            rows={4}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-[#EBBB69] focus:outline-none focus:ring-1 focus:ring-[#EBBB69] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Product description"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price ($)"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            required
          />
          <Input
            label="Compare at price / Discount ($)"
            type="number"
            step="0.01"
            min="0"
            value={form.compareAtPrice}
            onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
            placeholder="Original price for strikethrough"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.length > 0 ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={categories.includes(form.category) ? form.category : '__other__'}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category: e.target.value === '__other__' ? '' : e.target.value,
                  }))
                }
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-[#EBBB69] focus:outline-none focus:ring-1 focus:ring-[#EBBB69] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__other__">Other</option>
              </select>
              {(!form.category || !categories.includes(form.category)) && (
                <Input
                  label="Category name"
                  className="mt-2"
                  value={!categories.includes(form.category) ? form.category : ''}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Type category"
                />
              )}
            </div>
          ) : (
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
              placeholder="e.g. Electronics"
            />
          )}
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-[#EBBB69] focus:ring-[#EBBB69]"
          />
          <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
            Featured product
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Images
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateAiImage}
              disabled={generatingAi || !form.name.trim()}
              className="rounded-lg border border-[#EBBB69]/50 bg-[#EBBB69]/10 px-4 py-2 text-sm font-medium text-[#49474D] transition hover:bg-[#EBBB69]/20 disabled:opacity-50"
            >
              {generatingAi ? 'Generating…' : '✨ Generate with AI (DALL·E)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              + Select images
            </button>
            {previewFiles.length > 0 && (
              <button
                type="button"
                onClick={uploadPreviews}
                disabled={uploading}
                className="rounded-lg bg-[#EBBB69] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#d4a85c] disabled:opacity-50"
              >
                {uploading ? `Uploading… ${uploadProgress ? `${uploadProgress}%` : ''}` : `Upload ${previewFiles.length} file(s)`}
              </button>
            )}
          </div>

          {uploading && (
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-[#EBBB69] transition-all duration-300"
                  style={{ width: uploadProgress ? `${uploadProgress}%` : '30%' }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Uploading…</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previewFiles.map((p, i) => (
              <div
                key={p.objectUrl}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <img
                  src={p.objectUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  aria-label="Remove preview"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {form.images.map((img, i) => (
              <div
                key={img.url + i}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized={!img.url.includes('cloudinary')}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 transition hover:border-[#EBBB69] hover:text-[#EBBB69] disabled:opacity-50"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading} disabled={!canSubmit}>
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
