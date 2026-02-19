'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const qs = sessionId
      ? `session_id=${encodeURIComponent(sessionId)}`
      : orderId
        ? `order_id=${encodeURIComponent(orderId)}`
        : '';
    router.replace(qs ? `/order/success?${qs}` : '/order/success');
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
    </div>
  );
}
