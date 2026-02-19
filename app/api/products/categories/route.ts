import { getCategories } from '@/controllers/productController';

export async function GET() {
  return getCategories();
}
