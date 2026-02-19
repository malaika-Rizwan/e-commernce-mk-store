import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { RecentlyViewedTracker } from '@/components/product/RecentlyViewedTracker';
import { RecentlyViewedProducts } from '@/components/product/RecentlyViewedProducts';
import { ProductGallery } from './ProductGallery';
import { ProductInfoPanel } from './ProductInfoPanel';
import { ProductDetailsTabsWrapper } from './ProductDetailsTabsWrapper';
import { RelatedProducts } from './RelatedProducts';
import { ShareButtons } from './ShareButtons';
import { StickyAddToCart } from './StickyAddToCart';
import { ProductDetailsClient } from './ProductDetailsClient';
import { productImagesToUrls } from '@/lib/placeholderImages';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

async function getProduct(slug: string) {
  const res = await fetch(`${BASE_URL}/api/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getRelatedProducts(category?: string, excludeSlug?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('limit', '8');
  const res = await fetch(`${BASE_URL}/api/products?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  const products = json.data?.products ?? [];
  return excludeSlug ? products.filter((p: { slug: string }) => p.slug !== excludeSlug) : products;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  const title = product.name;
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} - $${product.price?.toFixed(2) ?? '0.00'}`;
  const imageUrl = typeof product.images?.[0] === 'string'
    ? product.images[0]
    : (product.images?.[0] as { url?: string })?.url;
  const imageUrlFull = imageUrl && (imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/product/${product.slug}`,
      ...(imageUrlFull && { images: [{ url: imageUrlFull, alt: product.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrlFull && { images: [imageUrlFull] }),
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session, related] = await Promise.all([
    getProduct(slug),
    getSession(),
    getRelatedProducts(undefined, slug),
  ]);
  if (!product) notFound();

  const category = product.category;
  const relatedByCategory =
    category && category.length > 0
      ? await getRelatedProducts(category, slug)
      : related;

  const images = product.images ?? [];
  const imageUrl = typeof images[0] === 'string' ? images[0] : images[0]?.url;
  const averageRating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const reviews = product.reviews ?? [];
  const features: string[] = product.features ?? [];
  const shortDescription =
    typeof product.shortDescription === 'string'
      ? product.shortDescription
      : product.description?.slice(0, 200) ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: productImagesToUrls(product.images) ?? [],
    sku: product.sku ?? product._id,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount,
        bestRating: 5,
      },
    }),
  };

  const productUrl = `${BASE_URL}/product/${product.slug}`;

  return (
    <div className="min-h-screen bg-pageBg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RecentlyViewedTracker
        product={{
          _id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          images: product.images,
        }}
      />

      <ProductDetailsClient
        productId={product._id}
        slug={product.slug}
        name={product.name}
        price={product.price}
        image={imageUrl ?? undefined}
        stock={product.stock ?? 0}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        <nav
          className="mb-8 text-sm text-darkBase/70 animate-fade-in"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primaryAccent">
            Home
          </Link>
          <span className="mx-2">/</span>
          {category ? (
            <>
              <Link
                href={`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`}
                className="hover:text-primaryAccent"
              >
                {category}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : (
            <>
              <Link href="/products" className="hover:text-primaryAccent">
                Products
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-darkBase">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[60%_1fr] lg:gap-14">
          <div className="animate-slide-up">
            <ProductGallery images={images} name={product.name} />
          </div>

          <div className="animate-slide-up">
            <ProductInfoPanel
              productId={product._id}
              slug={product.slug}
              name={product.name}
              brand={product.brand}
              category={category}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              stock={product.stock ?? 0}
              shortDescription={shortDescription}
              image={imageUrl ?? undefined}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
            <div className="mt-6">
              <ShareButtons url={productUrl} title={product.name} />
            </div>
          </div>
        </div>

        <div className="animate-fade-in">
          <ProductDetailsTabsWrapper
            description={product.description ?? ''}
            features={features}
            reviews={reviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
            productSlug={product.slug}
            productId={product._id}
            isLoggedIn={!!session}
          />
        </div>

        <RelatedProducts products={relatedByCategory} currentSlug={product.slug} />

        <RecentlyViewedProducts />
      </div>
    </div>
  );
}
