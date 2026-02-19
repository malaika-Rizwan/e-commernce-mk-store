'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const WISHLIST_STORAGE_KEY = 'ecom-wishlist-ids';

export function useWishlistIds(): {
  ids: Set<string>;
  loading: boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
} {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchIds = useCallback(async () => {
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
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      if (!res.ok) {
        setIds(new Set());
        return;
      }
      const json = await res.json();
      const products = json.data?.products ?? [];
      const productIds = products.map((p: { _id?: string }) => p._id?.toString()).filter(Boolean);
      setIds(new Set(productIds));
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIds();
  }, [fetchIds]);

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

  return { ids, loading, add, remove, toggle, refresh: fetchIds };
}
