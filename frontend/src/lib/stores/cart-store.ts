import { create } from 'zustand';
import { Cart } from '../api/types';

interface CartState {
  cart: Cart | null;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  itemCount: number;
}

export const useCartStore = create<CartState>(set => ({
  cart: null,
  itemCount: 0,
  setCart: cart => set({ cart, itemCount: cart.itemCount }),
  clearCart: () => set({ cart: null, itemCount: 0 }),
}));
