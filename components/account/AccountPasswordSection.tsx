'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';

export function AccountPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully');
      } else toast.error(data.error ?? 'Failed to update password');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl rounded-2xl shadow-md" padding="lg">
      <CardHeader>
        <CardTitle className="text-xl text-[#49474D]">Change password</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
            required
            minLength={6}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={loading}
          className="rounded-xl border-[#EBBB69] px-6 py-2.5 font-semibold text-[#49474D] hover:bg-[#EBBB69]/10"
        >
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Card>
  );
}
