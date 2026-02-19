'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/lib/validations/auth';

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-orange-500' },
    { label: 'Good', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-lime-500' },
    { label: 'Very strong', color: 'bg-green-500' },
  ];
  const i = Math.min(score, 5) - 1;
  return { score, label: levels[i]?.label ?? 'Weak', color: levels[i]?.color ?? 'bg-red-500' };
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    const result = registerSchema.safeParse({
      name,
      email,
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
      const result = await register(email, password, name, confirmPassword);
      if (result?.requiresVerification) {
        const params = new URLSearchParams({ email });
        if (result.emailSent === false) params.set('emailSent', '0');
        router.push(`/verify-email?${params.toString()}`);
        router.refresh();
        return;
      }
      router.push('/account');
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (err?: string) =>
    `block w-full rounded-lg border bg-white px-3 py-2.5 text-[#49474D] placeholder-[#49474D]/50 transition focus:outline-none focus:ring-2 ${
      err ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#EBBB69] focus:ring-[#EBBB69]/30'
    }`;

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#BEB9B4' }}
    >
      <div
        className="w-full max-w-md rounded-xl p-8 shadow-lg"
        style={{ backgroundColor: '#E6E2DE' }}
      >
        <h1 className="text-2xl font-bold text-[#49474D]">Create account</h1>
        <p className="mt-1 text-sm text-[#49474D]/80">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#EBBB69' }}>
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}
          <div>
            <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-[#49474D]">
              Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass(errors.name)}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-[#49474D]">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass(errors.email)}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-[#49474D]">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#49474D]/60 hover:text-[#49474D]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#49474D]/70">{strength.label}</span>
              </div>
            )}
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="reg-confirm" className="mb-1 block text-sm font-medium text-[#49474D]">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass(errors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#49474D]/60 hover:text-[#49474D]"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#49474D]/80">
          Already have an account?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: '#EBBB69' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
