'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'sonner';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
}

export function AccountProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    fetch('/api/users/profile', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data) {
          const d = data.data;
          setProfile(d);
          setForm({
            name: d.name ?? '',
            phone: d.phone ?? '',
            street: d.address?.street ?? '',
            city: d.address?.city ?? '',
            state: d.address?.state ?? '',
            postalCode: d.address?.postalCode ?? '',
            country: d.address?.country ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          address: {
            street: form.street || undefined,
            city: form.city || undefined,
            state: form.state || undefined,
            postalCode: form.postalCode || undefined,
            country: form.country || undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((p) => (p ? { ...p, name: form.name, phone: form.phone, address: data.data?.address ?? p.address } : null));
        toast.success('Profile updated');
      } else toast.error(data.error ?? 'Failed to update');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl rounded-2xl">
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EBBB69] border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="max-w-2xl rounded-2xl">
        <p className="p-6 text-gray-600 dark:text-gray-400">Could not load profile.</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl rounded-2xl shadow-md" padding="lg">
      <CardHeader>
        <CardTitle className="text-xl text-[#49474D]">Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">Email</label>
          <input
            type="email"
            value={profile.email}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600"
          />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#49474D]">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[#49474D] focus:border-[#EBBB69] focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/30"
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-[#E6E2DE]/30 p-4">
          <h4 className="mb-3 text-sm font-semibold text-[#49474D]">Address</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-[#49474D]/80">Street</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#49474D] focus:border-[#EBBB69] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#49474D]/80">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#49474D] focus:border-[#EBBB69] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#49474D]/80">State / Province</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#49474D] focus:border-[#EBBB69] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#49474D]/80">Postal code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#49474D] focus:border-[#EBBB69] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#49474D]/80">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#49474D] focus:border-[#EBBB69] focus:outline-none"
              />
            </div>
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
          className="rounded-xl px-6 py-2.5 font-semibold"
          style={{ backgroundColor: '#EBBB69' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Card>
  );
}
