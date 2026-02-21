'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface DeleteOrderButtonProps {
  orderId: string;
  orderDisplayId: string;
}

export function DeleteOrderButton({ orderId, orderDisplayId }: DeleteOrderButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/orders');
        router.refresh();
      } else {
        alert(data.error ?? 'Failed to delete');
      }
    } catch {
      alert('Network error');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Delete this order?</span>
        <Button variant="primary" size="sm" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
          {deleting ? 'Deleting...' : 'Yes, delete'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setConfirming(true)}
      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      Delete order
    </Button>
  );
}
