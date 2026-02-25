'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/lib/validations/auth';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verifyTwoFactor } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/account';
  const message = searchParams.get('message');

  useEffect(() => {
    if (message === 'verify') {
      setSubmitError('');
    }
  }, [message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    if (step === 'credentials') {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: { email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          const path = err.path[0] as string;
          if (path in fieldErrors) return;
          fieldErrors[path as 'email' | 'password'] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setLoading(true);
      try {
        const result = await login(email, password);
        if (result?.requiresTwoFactor && result.tempToken) {
          setTempToken(result.tempToken);
          setStep('2fa');
        } else {
          router.push(from);
          router.refresh();
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === '2fa') {
      const code = otp.replace(/\D/g, '');
      if (code.length !== 6) {
        setErrors({ otp: 'Enter the 6-digit code from your app' });
        return;
      }
      setLoading(true);
      try {
        await verifyTwoFactor(tempToken, code);
        router.push(from);
        router.refresh();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Invalid code. Try again.');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#BEB9B4' }}
    >
      <div
        className="w-full max-w-md rounded-xl p-8 shadow-lg transition-opacity duration-300"
        style={{ backgroundColor: '#E6E2DE' }}
      >
        <h1 className="text-2xl font-bold text-[#49474D]">
          {step === '2fa' ? 'Two-factor authentication' : 'Sign in'}
        </h1>
        <p className="mt-1 text-sm text-[#49474D]/80">
          {step === '2fa'
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Welcome back. Sign in to your account.'}
        </p>

        {message === 'verify' && step === 'credentials' && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Check your email to verify your account, then sign in below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {step === 'credentials' && (
            <>
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-[#49474D]">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-[#49474D]">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
                  }`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </>
          )}

          {step === '2fa' && (
            <>
              <div>
                <label htmlFor="login-otp" className="mb-1 block text-sm font-medium text-[#49474D]">
                  Authentication code
                </label>
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-center text-lg tracking-widest text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
                    errors.otp ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
                  }`}
                />
                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setStep('credentials'); setTempToken(''); setOtp(''); setSubmitError(''); }}
                className="text-sm font-medium text-[#49474D] hover:underline"
                style={{ color: '#EBBB69' }}
              >
                ← Use different account
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 font-semibold text-white transition disabled:opacity-70"
            style={{ backgroundColor: '#EBBB69' }}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {step === '2fa' ? 'Verifying...' : 'Signing in...'}
              </span>
            ) : (
              step === '2fa' ? 'Verify' : 'Sign in'
            )}
          </button>
        </form>

        {step === 'credentials' && (
          <div className="mt-6 space-y-2 text-center text-sm">
            <p>
              <Link href="/forgot-password" className="font-medium text-[#49474D] hover:underline" style={{ color: '#EBBB69' }}>
                Forgot password?
              </Link>
            </p>
            <p className="text-[#49474D]/80">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium hover:underline" style={{ color: '#EBBB69' }}>
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12" style={{ backgroundColor: '#BEB9B4' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#EBBB69] border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
