import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

function mergeCartItems(guest: CartItem[], server: CartItem[]): CartItem[] {
  const byId = new Map<string, CartItem>();
  for (const item of server) {
    byId.set(item.productId, { ...item });
  }
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

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>
    ) => {
      const qty = action.payload.quantity ?? 1;
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        existing.quantity += qty;
      } else {
        state.items.push({ ...action.payload, quantity: qty });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (i) => i.productId !== action.payload
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      if (quantity < 1) {
        state.items = state.items.filter((i) => i.productId !== productId);
        return;
      }
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    mergeCart: (state, action: PayloadAction<{ guest: CartItem[]; server: CartItem[] }>) => {
      state.items = mergeCartItems(action.payload.guest, action.payload.server);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setCart,
  mergeCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
