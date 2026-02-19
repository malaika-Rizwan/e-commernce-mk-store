'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { setCart } from '@/store/slices/cartSlice';
import type { CartItem } from '@/types';

const SYNC_DELAY_MS = 1500;

function mergeItems(guest: CartItem[], server: CartItem[]): CartItem[] {
  const byId = new Map<string, CartItem>();
  for (const item of server) byId.set(item.productId, { ...item });
  for (const item of guest) {
    const existing = byId.get(item.productId);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, item.quantity);
    } else {
      byId.set(item.productId, { ...item });
    }
  }
  return Array.from(byId.values());
}

export function useCartSync(userId: string | null) {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((s: RootState) => s.cart.items);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSyncedOnLogin = useRef(false);

  // After login: fetch server cart, merge with guest cart, set Redux and save to server
  useEffect(() => {
    if (!userId) {
      hasSyncedOnLogin.current = false;
      return;
    }

    let cancelled = false;

    async function syncAfterLogin() {
      try {
        const guestItems = items;
        const res = await fetch('/api/cart', { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const serverItems: CartItem[] = data.data?.items ?? [];

        if (guestItems.length === 0 && serverItems.length === 0) {
          hasSyncedOnLogin.current = true;
          return;
        }
        if (guestItems.length === 0) {
          dispatch(setCart(serverItems));
        } else if (serverItems.length === 0) {
          dispatch(setCart(guestItems));
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items: guestItems }),
          });
        } else {
          const merged = mergeItems(guestItems, serverItems);
          dispatch(setCart(merged));
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ items: merged }),
          });
        }
        hasSyncedOnLogin.current = true;
      } catch {
        // ignore
      }
    }

    if (!hasSyncedOnLogin.current) {
      const t = setTimeout(syncAfterLogin, 400);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // When cart changes and user is logged in, debounced save to server
  useEffect(() => {
    if (!userId || items.length === 0) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, SYNC_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [userId, items]);
}
