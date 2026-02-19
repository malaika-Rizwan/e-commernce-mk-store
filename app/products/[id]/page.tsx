'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { products } from '@/data/products';
import { RatingStars } from '@/components/review/RatingStars';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const product = useMemo(() => products.find((p) => p.id === String(id)), [id]);
  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const dispatch = useAppDispatch();

  if (!product) {
    return (
      <div className="min-h-screen bg-pageBg">
        <div className="container mx-auto max-w-[1200px] px-4 py-20 animate-fade-in">
          <div className="rounded-2xl bg-cardBg p-10 shadow-soft text-center">
            <h1 className="text-2xl font-bold text-darkBase">Product not found</h1>
            <p className="mt-2 text-sm text-darkBase/70">
              The product you’re looking for doesn’t exist.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <Button variant="primary">Back to Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = [product.image, product.image, product.image, product.image];
  const currentImage = images[selected] ?? product.image;
  const inStock = product.stock > 0;
  const maxQty = Math.max(1, Math.min(10, product.stock));

  function addToCart() {
    if (!product) return;
    dispatch(
      addItem({
        productId: product.id,
        slug: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image,
      })
    );
  }

  function buyNow() {
    addToCart();
    window.location.href = '/cart';
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-[1200px] px-4 py-12 sm:py-16 animate-fade-in">
        <nav className="mb-8 text-sm text-darkBase/70" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primaryAccent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primaryAccent">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-darkBase">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT — Images */}
          <div className="rounded-2xl bg-cardBg p-4 shadow-soft">
            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-pageBg/50">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === selected
                      ? 'border-primaryAccent ring-2 ring-primaryAccent/20'
                      : 'border-white/60 hover:border-darkBase/30'
                  }`}
                  aria-label={`Select image ${i + 1}`}
                >
                  <Image src={src} alt="" fill className="object-cover" unoptimized loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div>
            <h1 className="text-3xl font-bold text-darkBase">{product.name}</h1>
            <p className="mt-2 text-sm text-darkBase/70">
              Brand: <span className="font-medium text-darkBase">{product.brand}</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RatingStars rating={product.rating} size="md" />
              <span className="text-sm text-darkBase/70">
                {product.rating.toFixed(1)} · {product.reviewsCount} reviews
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <p className="text-3xl font-bold text-darkBase">
                Rs {new Intl.NumberFormat('en-PK').format(product.price)}
              </p>
              <button
                type="button"
                onClick={copyShareLink}
                className="rounded-xl border border-darkBase/20 bg-white px-4 py-2.5 text-sm font-semibold text-darkBase transition hover:bg-cardBg"
              >
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            <p className={`mt-3 text-sm font-medium ${inStock ? 'text-green-700' : 'text-red-600'}`}>
              {inStock ? `In stock (${product.stock})` : 'Out of stock'}
            </p>

            <p className="mt-6 text-sm leading-relaxed text-darkBase/90">{product.description}</p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-darkBase/70">
                Features
              </h2>
              <ul className="mt-3 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-darkBase">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primaryAccent" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-darkBase/70">
                  Quantity
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-darkBase/20 bg-white">
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    disabled={!inStock || qty <= 1}
                    className="h-11 w-11 text-darkBase transition hover:bg-cardBg disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setQty(Math.max(1, Math.min(maxQty, v)));
                    }}
                    className="h-11 w-16 border-x border-darkBase/20 text-center text-sm font-semibold text-darkBase focus:outline-none"
                    aria-label="Quantity"
                    disabled={!inStock}
                  />
                  <button
                    type="button"
                    onClick={() => setQty((v) => Math.min(maxQty, v + 1))}
                    disabled={!inStock || qty >= maxQty}
                    className="h-11 w-11 text-darkBase transition hover:bg-cardBg disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 min-w-[260px]">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!inStock}
                  className="hover:-translate-y-0.5 active:translate-y-0"
                  onClick={addToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled={!inStock}
                  className="border-darkBase bg-darkBase text-white hover:bg-darkBase/90 hover:text-white"
                  onClick={buyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-products-heading">
            <h2 id="related-products-heading" className="text-2xl font-bold text-darkBase">
              Related Products
            </h2>
            <p className="mt-1 text-sm text-darkBase/70">
              More picks from {product.category}.
            </p>
            <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} image={p.image} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

