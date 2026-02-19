import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useCartItems() {
  return useAppSelector((s) => s.cart.items);
}

export function useCartItemCount() {
  return useAppSelector((s) =>
    s.cart.items.reduce((acc, i) => acc + i.quantity, 0)
  );
}

export function useCartSubtotal() {
  return useAppSelector((s) =>
    s.cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  );
}
