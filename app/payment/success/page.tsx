'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';

interface OrderSummary {
  _id: string;
  orderId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderStatus?: string;
  paymentStatus?: string;
  transactionId?: string;
  safepayOrderId?: string;
  paymentMethod?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPrice: number;
  shippingAddress: { fullName: string; address: string; city: string; postalCode: string; country: string; phone?: string };
  createdAt: string;
  isPaid?: boolean;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderIdParam) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderIdParam}`, { credentials: 'include' });
        const data = await res.json();
        if (!cancelled) {
          if (data.success && data.data) setOrder(data.data);
          else setError(data.error ?? 'Order not found');
        }
      } catch {
        if (!cancelled) setError('Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOrder();
    return () => { cancelled = true; };
  }, [orderIdParam]);

  useEffect(() => {
    if ((order || orderIdParam) && !cleared) {
      dispatch(clearCart());
      setCleared(true);
    }
  }, [order, orderIdParam, dispatch, cleared]);

  const isPaid = order?.isPaid === true || order?.paymentStatus === 'paid';
  const estimatedDelivery = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery)
    : order
      ? new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
      </div>
    );
  }

  if (!orderIdParam || error) {
    return (
      <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center px-4">
        <p className="text-darkBase">{error || 'No order information found.'}</p>
        <Link href="/" className="mt-4">
          <Button variant="primary">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-darkBase">Order successful</h1>
          <p className="mt-2 text-gray-600">
            {isPaid
              ? 'Your payment was successful. A confirmation email has been sent.'
              : 'Your order has been placed. Payment is being confirmed.'}
          </p>

          <div className="mt-8 rounded-2xl bg-cardBg p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Order ID</p>
                <p className="mt-1 font-mono text-lg font-semibold text-darkBase">
                  {order.orderId ?? `#${order._id.slice(-8).toUpperCase()}`}
                </p>
              </div>
              {order.transactionId && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="mt-1 font-mono text-sm text-darkBase">{order.transactionId}</p>
                </div>
              )}
            </div>

            {order.shippingAddress && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">Delivery address</p>
                <p className="mt-1 text-sm text-darkBase">
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                  {order.shippingAddress.phone && <><br />{order.shippingAddress.phone}</>}
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500">Order summary</p>
              <ul className="mt-2 space-y-2">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm text-darkBase">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.quantity * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold text-darkBase">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {estimatedDelivery && (
              <p className="mt-4 text-sm text-gray-600">
                Estimated delivery: <strong>{estimatedDelivery.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/products">
              <Button variant="primary" className="w-full sm:w-auto bg-primaryAccent hover:bg-primaryAccent/90">
                Continue shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full sm:w-auto">View my orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
