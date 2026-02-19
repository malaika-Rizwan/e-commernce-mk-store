import { MetadataRoute } from 'next';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    await connectDB();
    const products = await Product.find({}).select('slug updatedAt').lean();
    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...productUrls];
  } catch {
    return staticRoutes;
  }
}
