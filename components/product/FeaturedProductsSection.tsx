import { ProductCard } from './ProductCard';

// Use absolute URL for server-side fetch (required when NEXT_PUBLIC_APP_URL is not set, e.g. local dev)
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[];
}

export async function FeaturedProductsSection() {
  try {
    // Fetch all products for home page (up to 100; featured first via sort handled by API if needed)
    const res = await fetch(`${BASE}/api/products?limit=100`, {
      next: { revalidate: 60 },
    });
    const json = res.ok ? await res.json() : { data: { products: [] } };
    const list: ApiProduct[] = (json as { data?: { products?: ApiProduct[] } }).data?.products ?? [];
    return (
      <section className="mt-14 sm:mt-18" aria-labelledby="featured-products-heading">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="featured-products-heading" className="text-2xl font-bold text-darkBase sm:text-3xl">
            Featured Products
          </h2>
        </div>
        {list.length === 0 ? (
          <p className="text-darkBase/70">No products yet. Add some in the admin panel.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.name}
                price={p.price}
                image={p.images?.[0] ?? ''}
                slug={p.slug}
                showWishlist
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch {
    return (
      <section className="mt-14 sm:mt-18" aria-labelledby="featured-products-heading">
        <h2 id="featured-products-heading" className="text-2xl font-bold text-darkBase sm:text-3xl">
          Featured Products
        </h2>
        <p className="mt-4 text-darkBase/70">Unable to load products. Try again later.</p>
      </section>
    );
  }
}
