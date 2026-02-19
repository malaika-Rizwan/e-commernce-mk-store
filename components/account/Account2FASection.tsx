'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface Account2FASectionProps {
  twoFactorEnabled: boolean;
}

export function Account2FASection({ twoFactorEnabled: initialEnabled }: Account2FASectionProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialEnabled);
  const [setupModal, setSetupModal] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [otp, setOtp] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSetupOpen() {
    setError('');
    setOtp('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Setup failed');
      setQrCodeDataUrl(data.data.qrCodeDataUrl);
      setSetupModal(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnableConfirm(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your app');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: code }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Enable failed');
      setTwoFactorEnabled(true);
      setSetupModal(false);
      setOtp('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disablePassword.trim()) {
      setError('Password is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Disable failed');
      setTwoFactorEnabled(false);
      setDisableModal(false);
      setDisablePassword('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {twoFactorEnabled ? 'Enabled — your account is protected with 2FA.' : 'Add an extra layer of security.'}
          </p>
          {twoFactorEnabled ? (
            <button
              type="button"
              onClick={() => { setDisableModal(true); setError(''); setDisablePassword(''); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Disable
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSetupOpen}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-70"
              style={{ backgroundColor: '#EBBB69' }}
            >
              {loading ? 'Loading...' : 'Enable'}
            </button>
          )}
        </div>
      </Card>

      {setupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setSetupModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-xl"
            style={{ backgroundColor: '#E6E2DE' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#49474D]">Scan QR code</h3>
            <p className="mt-1 text-sm text-[#49474D]/80">
              Scan with Google Authenticator or another TOTP app, then enter the 6-digit code below.
            </p>
            {qrCodeDataUrl && (
              <div className="mt-4 flex justify-center rounded-lg bg-white p-4">
                <img src={qrCodeDataUrl} alt="QR code for 2FA" width={180} height={180} />
              </div>
            )}
            <form onSubmit={handleEnableConfirm} className="mt-4 space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-center text-lg tracking-widest text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSetupModal(false); setOtp(''); setError(''); }}
                  className="flex-1 rounded-lg border border-[#49474D]/30 py-2 text-sm font-medium text-[#49474D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: '#EBBB69' }}
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {disableModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setDisableModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-xl"
            style={{ backgroundColor: '#E6E2DE' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#49474D]">Disable 2FA</h3>
            <p className="mt-1 text-sm text-[#49474D]/80">Enter your password to disable two-factor authentication.</p>
            <form onSubmit={handleDisableSubmit} className="mt-4 space-y-3">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <input
                type="password"
                placeholder="Password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDisableModal(false); setDisablePassword(''); setError(''); }}
                  className="flex-1 rounded-lg border border-[#49474D]/30 py-2 text-sm font-medium text-[#49474D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-70"
                  style={{ backgroundColor: '#EBBB69' }}
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
