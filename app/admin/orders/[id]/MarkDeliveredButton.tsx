'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface MarkDeliveredButtonProps {
  orderId: string;
  isPaid: boolean;
  isDelivered: boolean;
}

export function MarkDeliveredButton({
  orderId,
  isPaid,
  isDelivered,
}: MarkDeliveredButtonProps) {
  const router = useRouter();

  if (!isPaid || isDelivered) return null;

  async function handleClick() {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDelivered: true }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error ?? 'Failed to update');
      }
    } catch {
      alert('Network error');
    }
  }

  return (
    <Button variant="primary" size="sm" onClick={handleClick}>
      Mark as delivered
    </Button>
  );
}
