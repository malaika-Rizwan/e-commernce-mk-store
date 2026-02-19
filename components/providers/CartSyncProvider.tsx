'use client';

import { useAuth } from '@/context/AuthContext';
import { useCartSync } from '@/hooks/useCartSync';

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useCartSync(user?._id ?? null);
  return <>{children}</>;
}
