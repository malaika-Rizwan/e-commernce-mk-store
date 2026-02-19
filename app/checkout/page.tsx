'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCartItems } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import {
  shippingAddressSchema,
  type ShippingAddressInput,
} from '@/lib/validations/checkout';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const items = useCartItems();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState<ShippingAddressInput>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingAddressInput, string>>>({});
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?from=/checkout');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add items before checkout.
        </p>
        <Link href="/products" className="mt-6 inline-block">
          <Button variant="primary">Browse products</Button>
        </Link>
      </div>
    );
  }

  function getPayload() {
    const parsed = shippingAddressSchema.safeParse(address);
    if (!parsed.success) {
      const errs: Partial<Record<keyof ShippingAddressInput, string>> = {};
      parsed.error.errors.forEach((err) => {
        const path = err.path[0] as keyof ShippingAddressInput;
        if (!errs[path]) errs[path] = err.message;
      });
      setFieldErrors(errs);
      return null;
    }
    return {
      shippingAddress: parsed.data,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
      ...(couponCode ? { couponCode } : {}),
    };
  }

  async function handlePayWithCard(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const payload = getPayload();
    if (!payload) return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? 'Checkout failed';
        setError(msg);
        toast.error(msg);
        return;
      }

      if (data.data?.url) {
        window.location.href = data.data.url;
        return;
      }
      toast.error('Invalid response from server');
      setError('Invalid response from server');
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCashOnDelivery(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const payload = getPayload();
    if (!payload) return;

    setCodLoading(true);
    try {
      const res = await fetch('/api/checkout/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? 'Order failed';
        setError(msg);
        toast.error(msg);
        return;
      }

      const orderId = data.data?.orderId;
      if (orderId) {
        router.push(`/order/success?order_id=${orderId}`);
        return;
      }
      toast.error('Invalid response from server');
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setCodLoading(false);
    }
  }

  const anyLoading = loading || codLoading;

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-darkBase">
          Checkout
        </h1>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Shipping Address */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-cardBg p-6 shadow-soft sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-darkBase">
                  Shipping address
                </h2>
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <ShippingAddressForm
                  value={address}
                  onChange={setAddress}
                  errors={fieldErrors}
                />
              </div>
            </div>

            {/* Right: Order Summary + Payment */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-200 bg-cardBg p-6 shadow-soft">
                <CheckoutOrderSummary
                  appliedCoupon={couponCode}
                  onCouponChange={setCouponCode}
                />
                <div className="mt-6 space-y-3">
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={handlePayWithCard}
                    isLoading={loading}
                    disabled={anyLoading}
                    className="bg-primaryAccent hover:bg-primaryAccent/90"
                  >
                    Pay with Card
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={handleCashOnDelivery}
                    isLoading={codLoading}
                    disabled={anyLoading}
                    className="border-darkBase/30 text-darkBase hover:bg-darkBase/5"
                  >
                    Cash on Delivery
                  </Button>
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Pay with Card redirects to Stripe to complete payment securely.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
