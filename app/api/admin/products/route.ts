import { NextRequest } from 'next/server';
import { listProducts } from '@/controllers/productController';
import { createProduct } from '@/controllers/productController';

export async function GET(request: NextRequest) {
  return listProducts(request);
}

export async function POST(request: NextRequest) {
  return createProduct(request);
}
