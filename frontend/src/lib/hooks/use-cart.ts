import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartApi } from '../api/cart';
import { useCartStore } from '../stores/cart-store';

export function useCart(enabled: boolean = true) {
    const { setCart, clearCart: clearCartStore } = useCartStore();

    const query = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const cart = await cartApi.getCart();
            setCart(cart);
            return cart;
        },
        enabled,
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
            toast.success('Added to cart successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to add item to cart');
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
            toast.success('Cart updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update cart item');
        },
    });
}

export function useRemoveCartItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => cartApi.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Item removed from cart');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to remove item from cart');
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
            toast.success('Cart cleared');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to clear cart');
        },
    });
}
