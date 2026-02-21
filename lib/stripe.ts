import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY?.trim() || '';
// Avoid throwing at module load so app works without Stripe (e.g. COD only)
export const stripe = new Stripe(secretKey || 'sk_test_placeholder_not_configured', {
  typescript: true,
});

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100); // cents
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
