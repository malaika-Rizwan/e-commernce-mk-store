'use client';

import Link from 'next/link';
import { useCartItems, useCartItemCount, useCartSubtotal } from '@/store/hooks';
import { Button } from '@/components/ui/Button';

interface OrderSummaryProps {
  showCheckoutButton?: boolean;
  className?: string;
}

export function OrderSummary({
  showCheckoutButton = true,
  className = '',
}: OrderSummaryProps) {
  const items = useCartItems();
  const itemCount = useCartItemCount();
  const subtotal = useCartSubtotal();

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Order summary
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>
      <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
        Subtotal: ${subtotal.toFixed(2)}
      </p>
      {showCheckoutButton && items.length > 0 && (
        <Link href="/checkout" className="mt-6 block">
          <Button variant="primary" fullWidth>
            Proceed to checkout
          </Button>
        </Link>
      )}
    </div>
  );
}
