'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailFromUrl = searchParams.get('email') ?? '';
  const emailNotSent = searchParams.get('emailSent') === '0';
  const emailFailed = searchParams.get('emailFailed') === '1'; // e.g. Gmail daily limit

  const [mode, setMode] = useState<'auto' | 'form'>('auto');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setMode('auto');
      return;
    }
    if (emailFromUrl) {
      setMode('form');
      setEmail(emailFromUrl);
      setStatus('idle');
      return;
    }
    setMode('form');
    setStatus('idle');
  }, [token, emailFromUrl]);

  // Auto-verify when token is in URL
  useEffect(() => {
    if (mode !== 'auto' || !token) return;
    setStatus('loading');
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => router.push('/account'), 2500);
        } else {
          setStatus('error');
          setMessage(data.error ?? 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [mode, token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const codeDigits = code.replace(/\D/g, '').slice(0, 6);
    if (!trimmedEmail) {
      setMessage('Please enter your email address.');
      return;
    }
    if (codeDigits.length !== 6) {
      setMessage('Please enter the 6-digit code from your email.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmedEmail, code: codeDigits }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => router.push('/account'), 2500);
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Verification failed');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  async function handleResendCode() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Enter your email first');
      return;
    }
    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data?.message ?? 'New code sent to your email.');
      } else {
        toast.error(data.error ?? 'Could not resend code.');
      }
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setResendLoading(false);
    }
  }

  const cardClass = 'w-full max-w-md rounded-2xl bg-[#E6E2DE] p-8 shadow-lg';
  const inputClass =
    'block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-[#49474D] placeholder-[#49474D]/50 focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30';

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#BEB9B4' }}
    >
      <div className={cardClass}>
        {mode === 'auto' && (
          <>
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#49474D]/20 border-t-[#EBBB69]" />
                <p className="text-[#49474D]">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#49474D]">Email verified</h1>
                <p className="mt-2 text-[#49474D]/80">Your account is active. Redirecting to your account...</p>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-[#49474D]">Verification failed</h1>
                <p className="mt-2 text-[#49474D]/80">{message}</p>
                <Link
                  href="/login"
                  className="mt-6 inline-block rounded-xl px-4 py-2.5 font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#EBBB69' }}
                >
                  Sign in
                </Link>
              </div>
            )}
          </>
        )}

        {mode === 'form' && status !== 'success' && (
          <>
            <h1 className="text-2xl font-bold text-[#49474D]">Confirm your email</h1>
            {emailFailed && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The verification email could not be sent right now (e.g. daily sending limit). Your account was created. Use <strong>Resend code</strong> below in a few hours to receive the code, or try again tomorrow.
              </div>
            )}
            {emailNotSent && !emailFailed && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The server is not configured to send email yet, so you will not receive a verification code. Ask the site administrator to add SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) to enable signup emails.
              </div>
            )}
            <p className="mt-2 text-[#49474D]/80">
              {emailFailed
                ? 'When you receive the code (after using Resend code), enter it below to complete registration.'
                : emailNotSent
                  ? 'If the administrator has fixed email, enter the 6-digit code you received below.'
                  : 'We sent a 6-digit verification code to your email. Enter it below to complete registration.'}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {message && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
              )}
              <div>
                <label htmlFor="verify-email" className="mb-1 block text-sm font-medium text-[#49474D]">
                  Email
                </label>
                <input
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="verify-code" className="mb-1 block text-sm font-medium text-[#49474D]">
                  Verification code
                </label>
                <input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputClass} text-center text-xl tracking-[0.4em]`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl py-3 font-semibold text-white transition disabled:opacity-70"
                style={{ backgroundColor: '#EBBB69' }}
              >
                {status === 'loading' ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify and activate account'
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-[#49474D]/70">
              Didn’t get the email? Check spam,{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || status === 'loading'}
                className="font-medium underline hover:no-underline disabled:opacity-50"
                style={{ color: '#EBBB69' }}
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
              , or{' '}
              <Link href="/register" className="font-medium hover:underline" style={{ color: '#EBBB69' }}>
                sign up again
              </Link>
              .
            </p>
          </>
        )}

        {mode === 'form' && status === 'success' && (
          <div className="text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: '#16a34a' }}
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#49474D]">Account activated</h1>
            <p className="mt-2 text-[#49474D]/80">You can now sign in. Redirecting to your account...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center" style={{ backgroundColor: '#BEB9B4' }}>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EBBB69]/30 border-t-[#EBBB69]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
