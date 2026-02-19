import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import cartReducer from './slices/cartSlice';

// Avoid "redux-persist failed to create sync storage" on server: use noop when localStorage is unavailable
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};
const storage =
  typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : noopStorage;

const persistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'],
};

const persistedCartReducer = persistReducer(
  { ...persistConfig, key: 'cart' },
  cartReducer
);

let store: ReturnType<typeof createStore> | null = null;

function createStore() {
  return configureStore({
    reducer: {
      cart: persistedCartReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
}

export function getStore() {
  if (typeof window === 'undefined') {
    return configureStore({
      reducer: { cart: cartReducer },
    });
  }
  if (!store) {
    store = createStore();
    persistStore(store);
  }
  return store;
}

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
