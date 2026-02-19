'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface PurchaseActionsProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export function PurchaseActions({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: PurchaseActionsProps) {
  const dispatch = useAppDispatch();
  const maxQty = Math.max(1, Math.min(10, stock || 0));
  const options = useMemo(() => Array.from({ length: maxQty }, (_, i) => i + 1), [maxQty]);
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-6 flex flex-wrap items-end gap-3">
      <div className="min-w-[140px]">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity</label>
        <select
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10))}
          disabled={stock <= 0}
          className="w-full rounded-xl border border-white/60 bg-pageBg/50 px-3 py-2.5 text-sm font-medium text-darkBase focus:border-primaryAccent focus:outline-none focus:ring-2 focus:ring-primaryAccent/20 disabled:opacity-50"
        >
          {options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="primary"
        size="lg"
        disabled={stock <= 0}
        className="min-w-[200px] hover:-translate-y-[1px]"
        onClick={() =>
          dispatch(
            addItem({
              productId,
              slug,
              name,
              price,
              quantity: qty,
              image,
            })
          )
        }
      >
        Add to Cart
      </Button>

      <div className="pb-1">
        <WishlistButton productId={productId} size="md" />
      </div>
    </div>
  );
}

