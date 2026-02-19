import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100); // cents
}

export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
