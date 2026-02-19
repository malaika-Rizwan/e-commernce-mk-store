'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setErrors({});
    setSuccess(false);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const msg = result.error.errors.map((err) => err.message).join('. ');
      setErrors({ email: msg });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong');
        return;
      }

      setSuccess(true);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#BEB9B4' }}
    >
      <div
        className="w-full max-w-md rounded-xl p-8 shadow-lg"
        style={{ backgroundColor: '#E6E2DE' }}
      >
        <h1 className="text-2xl font-bold text-[#49474D]">Forgot password</h1>
        <p className="mt-1 text-sm text-[#49474D]/80">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {success ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            If an account exists with this email, you will receive a reset link shortly. Check your
            inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {submitError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
            )}
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-[#49474D]">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-semibold text-white transition disabled:opacity-70"
              style={{ backgroundColor: '#EBBB69' }}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#49474D]/80">
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#EBBB69' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
