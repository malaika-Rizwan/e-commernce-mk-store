'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordSchema } from '@/lib/validations/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken((t) => t || tokenFromUrl);
  }, [tokenFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    const result = resetPasswordSchema.safeParse({
      token: token.trim(),
      password,
      confirmPassword,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path in fieldErrors) return;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          password,
          confirmPassword,
        }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? 'Invalid or expired reset link');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/account'), 2000);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (err?: string) =>
    `block w-full rounded-lg border bg-white px-3 py-2.5 text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
      err ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
    }`;

  if (!tokenFromUrl && !token) {
    return (
      <div className="w-full max-w-md rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#E6E2DE' }}>
        <h1 className="text-2xl font-bold text-[#49474D]">Reset password</h1>
        <p className="mt-2 text-sm text-[#49474D]/80">
          Missing reset token. Use the link from your email or request a new reset link.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block font-medium hover:underline"
          style={{ color: '#EBBB69' }}
        >
          Request reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#E6E2DE' }}>
      <h1 className="text-2xl font-bold text-[#49474D]">Reset password</h1>
      <p className="mt-1 text-sm text-[#49474D]/80">Enter your new password below.</p>

      {success ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
          Password reset successful. Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}
          {!tokenFromUrl && (
            <div>
              <label htmlFor="reset-token" className="mb-1 block text-sm font-medium text-[#49474D]">
                Reset token
              </label>
              <input
                id="reset-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={inputClass(errors.token)}
                placeholder="Paste the token from your email"
              />
              {errors.token && <p className="mt-1 text-sm text-red-600">{errors.token}</p>}
            </div>
          )}
          <div>
            <label htmlFor="reset-password" className="mb-1 block text-sm font-medium text-[#49474D]">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass(errors.password)}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium text-[#49474D]">
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass(errors.confirmPassword)}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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
                Resetting...
              </span>
            ) : (
              'Reset password'
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#BEB9B4' }}
    >
      <Suspense
        fallback={
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EBBB69]/30 border-t-[#EBBB69]" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
