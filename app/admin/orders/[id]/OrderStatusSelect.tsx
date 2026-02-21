'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'cancelled'] as const;

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const orderStatus = e.target.value as (typeof STATUSES)[number];
    if (orderStatus === currentStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (data.success) router.refresh();
      else alert(data.error ?? 'Failed to update');
    } catch {
      alert('Network error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={updating}
      className="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
