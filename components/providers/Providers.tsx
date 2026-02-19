'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartSyncProvider } from '@/components/providers/CartSyncProvider';
import { getStore } from '@/store';

function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof getStore> | null>(null);
  if (storeRef.current === null) {
    storeRef.current = getStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider>
        <AuthProvider>
          <CartSyncProvider>{children}</CartSyncProvider>
        </AuthProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
