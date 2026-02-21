import { z } from 'zod';

const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,12}$/;

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100).trim(),
  address: z.string().min(1, 'Address is required').max(200).trim(),
  city: z.string().min(1, 'City is required').max(100).trim(),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(12)
    .trim()
    .regex(postalCodeRegex, 'Invalid postal code format'),
  country: z.string().min(1, 'Country is required').max(100).trim(),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20)
    .trim()
    .regex(phoneRegex, 'Invalid phone format'),
});

/** Single item for checkout: only productId + quantity. Price/name come from DB. */
export const checkoutItemMinimalSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

/** Checkout body: items are productId + quantity only; backend fetches product and uses DB price. */
export const createCheckoutSessionSchema = z.object({
  shippingAddress: shippingAddressSchema,
  items: z.array(checkoutItemMinimalSchema).min(1, 'Cart is empty'),
  couponCode: z.string().max(50).optional(),
});

/** Legacy schema (name, price, image) – kept for reference; prefer createCheckoutSessionSchema. */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).optional(),
  quantity: z.number().int().min(1),
  price: z.number().min(0).optional(),
  image: z.string().optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
