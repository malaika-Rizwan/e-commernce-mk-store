/**
 * Dynamic payment config – enable/disable gateways via .env.
 * Used by GET /api/config/payments to drive checkout UI.
 */

const env: Record<string, string | undefined> = typeof process !== 'undefined' ? process.env : {};

export const PAYMENT_METHODS = {
  cod: {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    route: '/api/checkout/cod',
    enabled: true,
  },
  card: {
    id: 'card',
    label: 'Pay with Card',
    description: 'Pakistan / South Africa cards & wallets (generic gateway)',
    route: '/api/checkout/card',
    enabled: Boolean(
      env.CARD_PAYMENT_API_URL?.trim() &&
        env.CARD_PAYMENT_MERCHANT_ID?.trim() &&
        env.CARD_PAYMENT_API_KEY?.trim()
    ),
  },
  jazzcash: {
    id: 'jazzcash',
    label: 'JazzCash',
    description: 'Pay with JazzCash wallet (Pakistan)',
    route: '/api/checkout/jazzcash',
    enabled: Boolean(
      (env.JAZZCASH_API_URL?.trim() || env.JAZZCASH_SANDBOX_URL?.trim()) &&
        env.JAZZCASH_MERCHANT_ID?.trim() &&
        (env.JAZZCASH_PASSWORD?.trim() || env.JAZZCASH_API_KEY?.trim())
    ),
  },
  easypaisa: {
    id: 'easypaisa',
    label: 'Easypaisa',
    description: 'Pay with Easypaisa wallet (Pakistan)',
    route: '/api/checkout/easypaisa',
    enabled: Boolean(
      (env.EASYPAISA_API_URL?.trim() || env.EASYPAISA_SANDBOX_URL?.trim()) &&
        env.EASYPAISA_STORE_ID?.trim() &&
        (env.EASYPAISA_HASH_KEY?.trim() || env.EASYPAISA_API_KEY?.trim())
    ),
  },
  safepay: {
    id: 'safepay',
    label: 'Safepay',
    description: 'Pay with Safepay (Pakistan)',
    route: '/api/checkout/safepay',
    enabled: Boolean(
      (env.SAFEPAY_API_URL?.trim() || env.SAFEPAY_SANDBOX_URL?.trim()) &&
        (env.SAFEPAY_API_KEY?.trim() || env.SAFEPAY_SECRET_KEY?.trim())
    ),
  },
  stripe: {
    id: 'stripe',
    label: 'Pay with Card (Stripe)',
    description: 'International cards via Stripe',
    route: '/api/checkout',
    enabled: Boolean(env.STRIPE_SECRET_KEY?.trim()),
  },
} as const;

export type PaymentMethodId = keyof typeof PAYMENT_METHODS;

export function getEnabledPaymentMethods(): Array<{
  id: PaymentMethodId;
  label: string;
  description: string;
  route: string;
}> {
  return (Object.entries(PAYMENT_METHODS) as Array<[PaymentMethodId, (typeof PAYMENT_METHODS)[PaymentMethodId]]>)
    .filter(([, config]) => config.enabled)
    .map(([id, config]) => ({
      id,
      label: config.label,
      description: config.description,
      route: config.route,
    }));
}
