'use client';

import { WishlistButton } from '@/components/wishlist/WishlistButton';

export function WishlistButtonClient({ productId }: { productId: string }) {
  return <WishlistButton productId={productId} size="md" />;
}
