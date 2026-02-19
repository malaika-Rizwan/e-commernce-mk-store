'use client';

import { useState } from 'react';
import { useCartItems, useCartItemCount, useCartSubtotal } from '@/store/hooks';

const SHIPPING_FLAT = 10;
const FREE_SHIPPING_THRESHOLD = 100;
const TAX_RATE = 0.1;

interface CheckoutOrderSummaryProps {
  appliedCoupon?: string | null;
  onCouponChange?: (code: string | null) => void;
}

export function CheckoutOrderSummary({
  appliedCoupon = null,
  onCouponChange,
}: CheckoutOrderSummaryProps) {
  const items = useCartItems();
  const itemCount = useCartItemCount();
  const subtotal = useCartSubtotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  const [couponInput, setCouponInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const totalBeforeDiscount = subtotal + shipping + tax;
  const total = Math.max(0, totalBeforeDiscount - discount);

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponError(null);
      setDiscount(0);
      onCouponChange?.(null);
      return;
    }
    setValidating(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      const data = json.data;
      if (data?.valid && data.discount > 0) {
        setDiscount(data.discount);
        onCouponChange?.(data.code ?? code);
      } else {
        setDiscount(0);
        onCouponChange?.(null);
        setCouponError(data?.message ?? 'Invalid coupon');
      }
    } catch {
      setDiscount(0);
      onCouponChange?.(null);
      setCouponError('Could not validate coupon');
    } finally {
      setValidating(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponInput('');
    setDiscount(0);
    setCouponError(null);
    onCouponChange?.(null);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Order summary
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Coupon code
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={validating}
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={validating}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            {validating ? '…' : 'Apply'}
          </button>
        </div>
        {couponError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{couponError}</p>
        )}
        {appliedCoupon && discount > 0 && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Coupon <strong>{appliedCoupon}</strong> applied (−${discount.toFixed(2)})
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="ml-2 underline hover:no-underline"
            >
              Remove
            </button>
          </p>
        )}
      </div>

      <dl className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            ${subtotal.toFixed(2)}
          </dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600 dark:text-gray-400">Shipping</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
          </dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gray-600 dark:text-gray-400">Tax (est.)</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            ${tax.toFixed(2)}
          </dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <dt>Discount</dt>
            <dd>−${discount.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-600">
          <dt className="font-semibold text-gray-900 dark:text-white">Total</dt>
          <dd className="font-semibold text-gray-900 dark:text-white">
            ${total.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
