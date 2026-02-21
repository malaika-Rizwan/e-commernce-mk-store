'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

interface SavedAddress {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const emptyForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

export function AccountAddressesSection() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function fetchAddresses() {
    fetch('/api/users/addresses', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.addresses) setAddresses(data.data.addresses);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Address added');
        setForm(emptyForm);
        setShowAdd(false);
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed to add');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/addresses/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, isDefault: form.isDefault }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Address updated');
        setEditingId(null);
        setForm(emptyForm);
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Default address updated');
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Address deleted');
        setConfirmDeleteId(null);
        fetchAddresses();
      } else {
        toast.error(data.error ?? 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved addresses</CardTitle>
        </CardHeader>
        <p className="p-6 text-gray-500">Loading...</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved addresses</CardTitle>
        {!showAdd && (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            Add address
          </Button>
        )}
      </CardHeader>
      <div className="p-6 pt-0 space-y-4">
        {showAdd && (
          <form onSubmit={handleAdd} className="rounded-lg border border-gray-200 p-4 space-y-3 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">New address</h3>
            <Input
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
            <Input
              label="Street address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
              />
              <Input
                label="Postal code"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                required
              />
            </div>
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Set as default</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save address'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setForm(emptyForm); }}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showAdd && (
          <p className="text-gray-500 dark:text-gray-400">No saved addresses. Add one for faster checkout.</p>
        )}

        {addresses.map((addr) => (
          <div key={addr._id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            {editingId === addr._id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
                <Input
                  label="Street address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
                  <Input label="Postal code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} required />
                </div>
                <Input label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Default</span>
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Update'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
                </div>
              </form>
            ) : (
              <>
                <p className="font-medium text-gray-900 dark:text-white">
                  {addr.fullName}
                  {addr.isDefault && <span className="ml-2 text-xs text-primaryAccent">(default)</span>}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{addr.phone}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingId(addr._id); setForm({ fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, postalCode: addr.postalCode, country: addr.country, isDefault: addr.isDefault ?? false }); }}>
                    Edit
                  </Button>
                  {!addr.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr._id)} disabled={saving}>
                      Set default
                    </Button>
                  )}
                  {confirmDeleteId === addr._id ? (
                    <>
                      <span className="text-sm text-red-600">Delete?</span>
                      <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(addr._id)} disabled={saving}>
                        Yes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>No</Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400" onClick={() => setConfirmDeleteId(addr._id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
