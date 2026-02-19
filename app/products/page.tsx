import { ProductsClient } from './ProductsClient';

export const metadata = {
  title: 'All Products',
  description:
    'Browse all products. Filter by category, search, and sort by price with a clean premium layout.',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-[1200px] px-4 py-20">
        <ProductsClient />
      </div>
    </div>
  );
}
