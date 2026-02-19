'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function OrderCancelPage() {
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-darkBase">
            Checkout cancelled
          </h1>
          <p className="mt-4 text-gray-600">
            Your payment was not completed. Your cart has been preserved so you
            can try again when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/checkout">
              <Button
                variant="primary"
                className="w-full sm:w-auto bg-primaryAccent hover:bg-primaryAccent/90"
              >
                Back to checkout
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
