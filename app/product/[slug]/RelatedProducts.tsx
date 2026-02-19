import Link from 'next/link';
import Image from 'next/image';
import { getProductDisplayImages } from '@/lib/placeholderImages';

interface RelatedProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[];
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  currentSlug: string;
}

export function RelatedProducts({ products, currentSlug }: RelatedProductsProps) {
  const filtered = products.filter((p) => p.slug !== currentSlug).slice(0, 4);
  if (filtered.length === 0) return null;

  return (
    <section className="mt-16 rounded-2xl bg-cardBg p-6 shadow-soft md:p-8">
      <h2 className="text-xl font-bold text-darkBase">You May Also Like</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product, index) => (
          <RelatedProductCard key={product._id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}

function RelatedProductCard({
  product,
  index,
}: {
  product: RelatedProduct;
  index: number;
}) {
  const images = getProductDisplayImages(product.images ?? [], index);
  const imageUrl = images[0];
  const isLocal = imageUrl && !imageUrl.includes('cloudinary');

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-pageBg/50 transition hover:shadow-soft"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-cardBg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
            loading="lazy"
            unoptimized={Boolean(isLocal)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-darkBase/50 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-darkBase">{product.name}</h3>
        <p className="mt-2 text-base font-bold text-primaryAccent">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
