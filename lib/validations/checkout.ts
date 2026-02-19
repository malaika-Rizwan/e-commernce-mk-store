import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  image: z.string().optional(),
});

export const createCheckoutSessionSchema = z.object({
  shippingAddress: shippingAddressSchema,
  items: z.array(checkoutItemSchema).min(1, 'Cart is empty'),
  couponCode: z.string().max(50).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
