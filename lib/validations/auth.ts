import { z } from 'zod';

const passwordMin = 6;
const passwordMax = 128;

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(passwordMin, `Password must be at least ${passwordMin} characters`)
      .max(passwordMax, `Password must be at most ${passwordMax} characters`),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(passwordMin, `Password must be at least ${passwordMin} characters`)
      .max(passwordMax, `Password must be at most ${passwordMax} characters`),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verify2FASchema = z.object({
  tempToken: z.string().min(1, 'Session expired. Please sign in again.'),
  otp: z.string().length(6, 'Enter the 6-digit code from your authenticator app').regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const enable2FASchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code').regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required to disable 2FA'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
