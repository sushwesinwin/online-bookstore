import { create } from 'zustand';
import { Cart } from '../api/types';

interface CartState {
  cart: Cart | null;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
  removeItems: (bookIds: string[]) => void;
  itemCount: number;
}

export const useCartStore = create<CartState>(set => ({
  cart: null,
  itemCount: 0,
  setCart: cart => set({ cart, itemCount: cart.itemCount }),
  clearCart: () => set({ cart: null, itemCount: 0 }),
  removeItems: bookIds =>
    set(state => {
      if (!state.cart) {
        return state;
      }

      const remainingItems = state.cart.items.filter(
        item => !bookIds.includes(item.bookId)
      );
      const itemCount = remainingItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const total = remainingItems.reduce(
        (sum, item) => sum + Number(item.book.price) * item.quantity,
        0
      );

      return {
        cart: {
          ...state.cart,
          items: remainingItems,
          itemCount,
          total,
        },
        itemCount,
      };
    }),
}));
