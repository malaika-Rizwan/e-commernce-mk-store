import { NextRequest } from 'next/server';
import { getProductBySlug } from '@/controllers/productController';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return getProductBySlug(slug);
}
