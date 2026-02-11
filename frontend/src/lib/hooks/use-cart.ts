import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { useCartStore } from '../stores/cart-store';

export function useCart() {
    const { setCart, clearCart: clearCartStore } = useCartStore();

    const query = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const cart = await cartApi.getCart();
            setCart(cart);
            return cart;
        },
    });

    return query;
}

export function useAddToCart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bookId, quantity }: { bookId: string; quantity: number }) =>
            cartApi.addItem(bookId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useUpdateCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            cartApi.updateItem(itemId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useRemoveCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => cartApi.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

export function useClearCart() {
    const queryClient = useQueryClient();
    const { clearCart: clearCartStore } = useCartStore();

    return useMutation({
        mutationFn: () => cartApi.clearCart(),
        onSuccess: () => {
            clearCartStore();
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}
