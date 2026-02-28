'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useCartItems } from '@/store/hooks';
import { removeItem } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/Button';
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import {
  shippingAddressSchema,
  type ShippingAddressInput,
} from '@/lib/validations/checkout';

interface SavedAddress {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const STEPS = ['Cart', 'Address', 'Order summary', 'Place order'];

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  route: string;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const items = useCartItems();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const currentStep = 2;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?from=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/users/addresses', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.addresses) {
          setSavedAddresses(data.data.addresses);
          const defaultAddr = data.data.addresses.find((a: SavedAddress) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setAddress({
              fullName: defaultAddr.fullName,
              address: defaultAddr.address,
              city: defaultAddr.city,
              postalCode: defaultAddr.postalCode,
              country: defaultAddr.country,
              phone: defaultAddr.phone,
            });
          }
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetch('/api/config/payments', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data?.paymentMethods)) {
          setPaymentMethods(data.data.paymentMethods);
        }
      })
      .catch(() => {})
      .finally(() => setPaymentMethodsLoading(false));
  }, []);

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
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      ...(couponCode ? { couponCode } : {}),
    };
  }

  async function handlePayment(e: React.FormEvent, method: PaymentMethod) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const payload = getPayload();
    if (!payload) return;

    setLoadingId(method.id);
    try {
      const res = await fetch(method.route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? 'Checkout failed';
        const unavailableIds = data.unavailableProductIds as string[] | undefined;
        if (Array.isArray(unavailableIds) && unavailableIds.length > 0) {
          unavailableIds.forEach((id) => dispatch(removeItem(id)));
          const removedMsg = 'Some products were removed from your cart (no longer available). Please try again.';
          setError(removedMsg);
          toast.error(removedMsg);
        } else {
          setError(msg);
          toast.error(msg);
        }
        return;
      }

      if (data.data?.url) {
        window.location.href = data.data.url;
        return;
      }
      const orderId = data.data?.orderId;
      if (orderId) {
        router.push(`/order/success?order_id=${orderId}`);
        return;
      }
      toast.error('Invalid response from server');
      setError('Invalid response from server');
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  const anyLoading = loadingId !== null;

  function selectSavedAddress(a: SavedAddress) {
    setSelectedAddressId(a._id);
    setAddress({
      fullName: a.fullName,
      address: a.address,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
      phone: a.phone,
    });
    setFieldErrors({});
  }

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-darkBase">
          Checkout
        </h1>

        {/* Step progress */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className={
                  i + 1 === currentStep
                    ? 'font-semibold text-primaryAccent'
                    : i + 1 < currentStep
                      ? 'text-gray-500'
                      : 'text-gray-400'
                }
              >
                {i + 1}. {step}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-gray-300 dark:text-gray-600">→</span>
              )}
            </span>
          ))}
        </nav>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Shipping Address */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-cardBg p-6 shadow-soft sm:p-8">
                <h2 className="mb-4 text-lg font-semibold text-darkBase">
                  Shipping address
                </h2>
                {savedAddresses.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Use a saved address</p>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map((a) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => selectSavedAddress(a)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm ${
                            selectedAddressId === a._id
                              ? 'border-primaryAccent bg-primaryAccent/10 text-darkBase'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {a.fullName}, {a.city}
                          {a.isDefault && (
                            <span className="ml-1 text-xs text-primaryAccent">(default)</span>
                          )}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(null);
                          setAddress({
                            fullName: '',
                            address: '',
                            city: '',
                            postalCode: '',
                            country: '',
                            phone: '',
                          });
                        }}
                        className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400"
                      >
                        Add new
                      </button>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <ShippingAddressForm
                  value={address}
                  onChange={(v) => {
                    setAddress(v);
                    setSelectedAddressId(null);
                  }}
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
                  {paymentMethodsLoading ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                      Loading payment options…
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <p className="text-center text-sm text-amber-600 dark:text-amber-400">
                      No payment methods configured. Add gateway env vars (see docs).
                    </p>
                  ) : (
                    paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        type="button"
                        variant={method.id === 'cod' ? 'outline' : 'primary'}
                        fullWidth
                        onClick={(e) => handlePayment(e, method)}
                        isLoading={loadingId === method.id}
                        disabled={anyLoading}
                        className={
                          method.id === 'cod'
                            ? 'border-darkBase/30 text-darkBase hover:bg-darkBase/5'
                            : 'bg-primaryAccent hover:bg-primaryAccent/90'
                        }
                        title={method.description}
                      >
                        {method.label}
                      </Button>
                    ))
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">
                  Payment options are loaded from your config. Redirect gateways open in a new step to complete payment.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
