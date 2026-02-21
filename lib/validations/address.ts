import { z } from 'zod';

const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,12}$/;

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Name is too long')
    .trim(),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20)
    .trim()
    .regex(phoneRegex, 'Invalid phone format (use 10–20 digits, spaces, +, -, parentheses)'),
  address: z
    .string()
    .min(1, 'Street address is required')
    .max(200, 'Address is too long')
    .trim(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City is too long')
    .trim(),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(12)
    .trim()
    .regex(postalCodeRegex, 'Invalid postal code format (3–12 alphanumeric characters)'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country is too long')
    .trim(),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressSchema.partial();

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
