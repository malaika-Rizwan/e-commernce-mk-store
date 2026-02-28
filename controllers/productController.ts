import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  serverUnavailableResponse,
} from '@/lib/api-response';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from '@/lib/validations/product';
import type { IProductImage } from '@/types';

/** Normalize images from DB: legacy string[] or mixed → IProductImage[] */
function normalizeProductImages(raw: unknown): IProductImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string' && item) return { url: item, public_id: '' };
      if (item && typeof item === 'object' && 'url' in item && typeof (item as { url: string }).url === 'string')
        return { url: (item as { url: string }).url, public_id: (item as { public_id?: string }).public_id ?? '' };
      return null;
    })
    .filter((x): x is IProductImage => x != null);
}

function normalizeProduct<T extends { images?: unknown }>(p: T): T {
  return { ...p, images: normalizeProductImages(p.images) };
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()
  );
}

export async function listProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listProductsQuerySchema.safeParse({
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '12',
      q: searchParams.get('q') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      priceMin: searchParams.get('priceMin') ?? undefined,
      priceMax: searchParams.get('priceMax') ?? undefined,
      featured: searchParams.get('featured') ?? undefined,
    });

    const query = parsed.success ? parsed.data : listProductsQuerySchema.parse({});
    const { page, limit, q, category, priceMin, priceMax, featured } = query;

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (q?.trim()) {
      filter.$or = [
        { name: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') },
      ];
    }
    if (priceMin != null || priceMax != null) {
      filter.price = {};
      if (priceMin != null) (filter.price as Record<string, number>).$gte = priceMin;
      if (priceMax != null) (filter.price as Record<string, number>).$lte = priceMax;
    }

    const skip = (page - 1) * limit;
    const [rawProducts, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);
    const products = rawProducts.map(normalizeProduct);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product list error:', err);
    return serverErrorResponse();
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return notFoundResponse('Product not found');
    return successResponse(normalizeProduct(product));
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product get error:', err);
    return serverErrorResponse();
  }
}

export async function getProductById(id: string) {
  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return notFoundResponse('Product not found');
    return successResponse(normalizeProduct(product));
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product get error:', err);
    return serverErrorResponse();
  }
}

export async function createProduct(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const data = parsed.data;
    await connectDB();

    const slug = slugify(data.name);
    const images = (data.images ?? []).map((img: IProductImage) => ({ url: img.url, public_id: img.public_id ?? '' }));
    const product = await Product.create({
      ...data,
      slug,
      images,
      compareAtPrice: data.compareAtPrice ?? undefined,
    });

    return successResponse(normalizeProduct(product.toObject()), 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product create error:', err);
    return serverErrorResponse();
  }
}

export async function updateProduct(request: NextRequest, id: string) {
  try {
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('. ');
      return errorResponse(msg, 400);
    }

    const data = parsed.data;
    await connectDB();

    const product = await Product.findById(id);
    if (!product) return notFoundResponse('Product not found');

    if (data.name != null && data.name !== product.name) {
      product.slug = slugify(data.name);
    }
    if (data.images != null) {
      product.images = (data.images as IProductImage[]).map((img) => ({ url: img.url, public_id: img.public_id ?? '' }));
    }
    Object.assign(product, {
      ...data,
      images: product.images,
      compareAtPrice: data.compareAtPrice ?? product.compareAtPrice,
    });
    await product.save();

    return successResponse(normalizeProduct(product.toObject()));
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product update error:', err);
    return serverErrorResponse();
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return notFoundResponse('Product not found');
    return successResponse({ message: 'Product deleted' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Product delete error:', err);
    return serverErrorResponse();
  }
}

export async function getCategories() {
  try {
    await connectDB();
    const categories = await Product.distinct('category').then((arr) =>
      arr.filter(Boolean).sort()
    );
    return successResponse({ categories });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('MONGODB_URI') || msg.includes('environment variable')) {
      return serverUnavailableResponse();
    }
    console.error('Categories error:', err);
    return serverErrorResponse();
  }
}
