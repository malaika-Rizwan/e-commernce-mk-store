'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { useWishlistIds } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface WishlistProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[] | { url: string }[];
}

function getImageUrl(p: WishlistProduct): string {
  const first = p.images?.[0];
  return typeof first === 'string' ? first : (first as { url?: string })?.url ?? '';
}

function WishlistCard({
  product: p,
  removingId,
  onRemove,
  onMoveToCart,
}: {
  product: WishlistProduct;
  removingId: string | null;
  onRemove: () => Promise<void>;
  onMoveToCart: () => void;
}) {
  const imageUrl = getImageUrl(p);
  const isLocal = imageUrl?.startsWith('/') && !imageUrl.startsWith('http');
  const formattedPrice = new Intl.NumberFormat('en-PK').format(p.price);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-darkBase/10 bg-cardBg shadow-soft transition hover:shadow-card-hover">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square w-full overflow-hidden bg-cardBg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={p.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw, 33vw"
            unoptimized={!!isLocal}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-darkBase/40 text-sm">No image</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${p.slug}`}>
          <h3 className="line-clamp-2 font-semibold text-darkBase hover:underline">{p.name}</h3>
        </Link>
        <p className="mt-2 text-lg font-bold text-darkBase">Rs {formattedPrice}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.preventDefault(); onMoveToCart(); }}
            className="flex-1 min-w-[100px]"
          >
            Move to cart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.preventDefault(); onRemove(); }}
            disabled={removingId === p._id}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {removingId === p._id ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WishlistContent() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { refresh: refreshWishlistIds } = useWishlistIds();

  function loadWishlist() {
    if (!user) return;
    setLoading(true);
    fetch('/api/wishlist', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { data: { products: [] } }))
      .then((json) => setProducts(json.data?.products ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWishlist();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-pageBg">
        <div className="container mx-auto max-w-[1200px] px-4 py-20">
          <div className="h-8 w-48 animate-pulse rounded bg-cardBg" />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-xl bg-cardBg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-[1200px] px-4 py-20">
        <h1 className="text-3xl font-bold text-darkBase">Wishlist</h1>
        <p className="mt-2 text-sm text-darkBase/70">
          Products you saved for later.
        </p>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[420px] animate-pulse rounded-xl bg-cardBg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-darkBase/20 bg-cardBg/50 py-16 text-center">
            <p className="text-darkBase/70">Your wishlist is empty. Save items from product pages.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-primaryAccent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <WishlistCard
                key={p._id}
                product={p}
                removingId={removingId}
                onRemove={async () => {
                  setRemovingId(p._id);
                  try {
                    const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(p._id)}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    });
                    const data = await res.json();
                    if (data.success) {
                      setProducts((prev) => prev.filter((x) => x._id !== p._id));
                      refreshWishlistIds();
                      toast.success('Removed from wishlist');
                    } else toast.error(data.error ?? 'Failed to remove');
                  } catch {
                    toast.error('Failed to remove');
                  } finally {
                    setRemovingId(null);
                  }
                }}
                onMoveToCart={() => {
                  dispatch(
                    addItem({
                      productId: p._id,
                      slug: p.slug,
                      name: p.name,
                      price: p.price,
                      quantity: 1,
                      image: getImageUrl(p),
                    })
                  );
                  toast.success('Added to cart');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
