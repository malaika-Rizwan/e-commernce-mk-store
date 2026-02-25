'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const STATUS_STEPS = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'] as const;

function getStatusIndex(status: string): number {
  const i = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  return i >= 0 ? i : 0;
}

interface TrackResult {
  orderId: string;
  trackingNumber: string;
  orderStatus: string;
  estimatedDelivery: string | null;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  totalPrice: number;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const trackingParam = searchParams.get('tracking') ?? '';
  const [tracking, setTracking] = useState(trackingParam);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = trackingParam.trim();
    if (!t) return;
    setTracking(t);
    setError('');
    setResult(null);
    setLoading(true);
    let cancelled = false;
    fetch(`/api/orders/track?tracking=${encodeURIComponent(t)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.data) setResult(data.data);
        else setError(data.error ?? 'Order not found');
      })
      .catch(() => {
        if (!cancelled) setError('Network error. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trackingParam]);

  async function handleTrack(t: string) {
    if (!t) return;
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?tracking=${encodeURIComponent(t)}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) setResult(data.data);
      else setError(data.error ?? 'Order not found');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = tracking.trim();
    if (!t) {
      setError('Enter your tracking number');
      return;
    }
    await handleTrack(t);
  }

  const currentIndex = result ? getStatusIndex(result.orderStatus) : -1;

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-darkBase">Track your order</h1>

        <form onSubmit={handleSubmit} className="mb-10 max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Enter tracking number"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-darkBase placeholder-gray-500 focus:border-primaryAccent focus:outline-none focus:ring-2 focus:ring-primaryAccent/20"
              autoComplete="off"
            />
            <Button type="submit" variant="primary" disabled={loading} className="bg-primaryAccent hover:bg-primaryAccent/90">
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>

        {result && (
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="rounded-2xl bg-cardBg p-6 shadow-soft">
              <div className="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-6">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Order ID</p>
                  <p className="font-mono text-lg font-semibold text-darkBase">{result.orderId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Tracking number</p>
                  <p className="font-mono text-lg font-semibold text-darkBase">{result.trackingNumber}</p>
                </div>
                {result.estimatedDelivery && (
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Estimated delivery</p>
                    <p className="text-darkBase">
                      {new Date(result.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery timeline */}
              <h2 className="mb-4 text-lg font-semibold text-darkBase">Delivery status</h2>
              <ul className="space-y-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = currentIndex >= i;
                  const current = currentIndex === i;
                  return (
                    <li key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            done
                              ? 'border-primaryAccent bg-primaryAccent text-white'
                              : 'border-gray-300 bg-white text-gray-400'
                          } ${current ? 'ring-4 ring-primaryAccent/30' : ''}`}
                        >
                          {done ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{i + 1}</span>
                          )}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 flex-1 min-h-[24px] ${i < currentIndex ? 'bg-primaryAccent' : 'bg-gray-200'}`}
                          />
                        )}
                      </div>
                      <div className="pb-8 pt-1">
                        <p className={`font-medium ${done ? 'text-darkBase' : 'text-gray-500'}`}>{step}</p>
                        {current && <p className="mt-0.5 text-sm text-gray-500">Current status</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl bg-cardBg p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-darkBase">Items</h2>
              <ul className="space-y-2">
                {result.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-darkBase">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.quantity * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between font-semibold text-darkBase">
                <span>Total</span>
                <span>${result.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {result.shippingAddress && (
              <div className="rounded-2xl bg-cardBg p-6 shadow-soft">
                <h2 className="mb-2 text-lg font-semibold text-darkBase">Shipping to</h2>
                <p className="text-gray-600">
                  {result.shippingAddress.fullName}
                  <br />
                  {result.shippingAddress.address}
                  <br />
                  {result.shippingAddress.city}, {result.shippingAddress.postalCode}
                  <br />
                  {result.shippingAddress.country}
                  {result.shippingAddress.phone && (
                    <>
                      <br />
                      {result.shippingAddress.phone}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link href="/" className="text-primaryAccent hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pageBg flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
