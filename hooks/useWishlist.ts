'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const WISHLIST_STORAGE_KEY = 'ecom-wishlist-ids';

const inFlightByUserId = new Map<string, Promise<Set<string>>>();

async function fetchWishlistIdsForUser(userId: string): Promise<Set<string>> {
  const existing = inFlightByUserId.get(userId);
  if (existing) return existing;
  const promise = (async () => {
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      if (!res.ok) return new Set<string>();
      const json = await res.json();
      const products = json.data?.products ?? [];
      const productIds = products.map((p: { _id?: string }) => p._id?.toString()).filter(Boolean);
      return new Set(productIds);
    } catch {
      return new Set<string>();
    } finally {
      inFlightByUserId.delete(userId);
    }
  })();
  inFlightByUserId.set(userId, promise);
  return promise;
}

export function useWishlistIds(): {
  ids: Set<string>;
  loading: boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const { user } = useAuth();
  const userId = user?._id ?? '';
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchIds = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const arr = raw ? (JSON.parse(raw) as string[]) : [];
            setIds(new Set(Array.isArray(arr) ? arr : []));
          } catch {
            setIds(new Set());
          }
        } else {
          setIds(new Set());
        }
        setLoading(false);
        return;
      }
      if (forceRefresh) inFlightByUserId.delete(user._id);
      setLoading(true);
      const next = await fetchWishlistIdsForUser(user._id);
      setIds(next);
      setLoading(false);
    },
    [userId]
  );

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

  const refresh = useCallback(() => fetchIds(true), [fetchIds]);

  const add = useCallback(
    async (productId: string) => {
      if (user) {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId }),
        });
        if (res.ok) setIds((prev) => new Set(prev).add(productId));
      } else {
        setIds((prev) => {
          const next = new Set(prev).add(productId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(next)));
          }
          return next;
        });
      }
    },
    [user]
  );

  const remove = useCallback(
    async (productId: string) => {
      if (user) {
        await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          if (typeof window !== 'undefined') {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(next)));
          }
          return next;
        });
      }
    },
    [user]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (ids.has(productId)) await remove(productId);
      else await add(productId);
    },
    [ids, add, remove]
  );

  return { ids, loading, add, remove, toggle, refresh };
}
