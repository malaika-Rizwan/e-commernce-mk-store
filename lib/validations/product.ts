import { z } from 'zod';

const productImageSchema = z.object({
  url: z.string().min(1),
  public_id: z.string().default(''),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  compareAtPrice: z.number().min(0).optional().nullable(),
  images: z.array(productImageSchema).default([]),
  category: z.string().min(1, 'Category is required').max(100).trim(),
  features: z.array(z.string()).default([]),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  sku: z.string().max(100).trim().optional(),
  featured: z.boolean().default(false),
  salesCount: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  brand: z.string().max(100).trim().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional().nullable(),
  category: z.string().min(1).max(100).trim().optional(),
  stock: z.number().int().min(0).optional(),
  features: z.array(z.string()).optional(),
  sku: z.string().max(100).trim().optional(),
  salesCount: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  brand: z.string().max(100).trim().optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().optional(),
  category: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
