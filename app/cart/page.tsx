'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useCartItems, useCartItemCount, useCartSubtotal } from '@/store/hooks';
import { removeItem, updateQuantity } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { OrderSummary } from '@/components/cart/OrderSummary';

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20];

export default function CartPage() {
  const items = useCartItems();
  const itemCount = useCartItemCount();
  const dispatch = useAppDispatch();

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add some products to get started.
        </p>
        <Link href="/products" className="mt-6 inline-block">
          <Button variant="primary">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Shopping cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 py-6 first:pt-0"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized={item.image.startsWith('http')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={item.slug ? `/product/${item.slug}` : '#'}
                      className="font-medium text-gray-900 hover:text-primary-600 dark:text-white"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: parseInt(e.target.value, 10),
                          })
                        )
                      }
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      {QUANTITY_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => dispatch(removeItem(item.productId))}
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right font-medium text-gray-900 dark:text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
