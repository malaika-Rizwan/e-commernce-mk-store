'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';

interface OrderSummary {
  _id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPrice: number;
  shippingAddress: { fullName: string; address: string; city: string; postalCode: string; country: string };
  createdAt: string;
  isPaid?: boolean;
  paymentMethod?: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderIdParam = searchParams.get('order_id');
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!sessionId && !orderIdParam) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchOrder() {
      try {
        if (orderIdParam) {
          const res = await fetch(`/api/orders/${orderIdParam}`, {
            credentials: 'include',
          });
          const data = await res.json();
          if (data.success && data.data) {
            if (!cancelled) setOrder(data.data);
          }
        } else if (sessionId) {
          const res = await fetch(
            `/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`,
            { credentials: 'include' }
          );
          const data = await res.json();
          if (data.success && data.data) {
            if (!cancelled) setOrder(data.data);
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [sessionId, orderIdParam]);

  useEffect(() => {
    if ((order || orderIdParam) && !cleared) {
      dispatch(clearCart());
      setCleared(true);
    }
  }, [order, orderIdParam, dispatch, cleared]);

  const estimatedDelivery = order
    ? new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
      </div>
    );
  }

  if (!sessionId && !orderIdParam) {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center px-4">
        <p className="text-darkBase">No order or session information found.</p>
        <Link href="/" className="mt-4">
          <Button variant="primary">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-darkBase">
            Thank you for your order
          </h1>
          <p className="mt-2 text-gray-600">
            Your order has been placed successfully. A confirmation email has been sent to you.
          </p>

          {order && (
            <div className="mt-8 rounded-2xl bg-cardBg p-6 shadow-soft">
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="mt-1 font-mono text-lg font-semibold text-darkBase">
                #{order._id.slice(-8).toUpperCase()}
              </p>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">Order summary</p>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-sm text-darkBase"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-gray-200 pt-3 flex justify-between font-semibold text-darkBase">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-500">
                    Shipping address
                  </p>
                  <p className="mt-1 text-sm text-darkBase">
                    {order.shippingAddress.fullName}
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}

              {estimatedDelivery && (
                <p className="mt-4 text-sm text-gray-600">
                  Estimated delivery:{' '}
                  <strong>
                    {estimatedDelivery.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@mkstore.com"
              className="text-primaryAccent hover:underline"
            >
              support@mkstore.com
            </a>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/products">
              <Button
                variant="primary"
                className="w-full sm:w-auto bg-primaryAccent hover:bg-primaryAccent/90"
              >
                Continue shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full sm:w-auto">
                View my orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
