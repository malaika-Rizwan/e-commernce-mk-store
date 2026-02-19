'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/order/cancel');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primaryAccent border-t-transparent" />
    </div>
  );
}
