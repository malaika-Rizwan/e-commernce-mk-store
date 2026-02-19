import { NextRequest } from 'next/server';
import { listProducts } from '@/controllers/productController';

export async function GET(request: NextRequest) {
  return listProducts(request);
}
