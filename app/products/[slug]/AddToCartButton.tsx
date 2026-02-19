'use client';

import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() =>
        dispatch(addItem({
          productId,
          slug,
          name,
          price,
          quantity: 1,
          image,
        }))
      }
    >
      Add to cart
    </Button>
  );
}
