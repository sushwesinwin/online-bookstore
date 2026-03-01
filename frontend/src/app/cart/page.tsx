'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from '@/lib/hooks/use-cart';
import { ordersApi } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (
    itemId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateItem({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      removeItem(itemId);
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { url } = await ordersApi.createCheckoutSession();
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to create checkout session'
      );
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to view your cart
          </p>
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {isEmpty
              ? 'Your cart is empty'
              : `${cart.itemCount} item${cart.itemCount !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link href="/books">
              <Button size="lg">
                Browse Books
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-6"
                >
                  {/* Book Image */}
                  <Link
                    href={`/books/${item.book.id}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-full sm:w-32 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                      {item.book.imageUrl ? (
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${item.book.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 mb-2">
                        {item.book.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-2">by {item.book.author}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {item.book.category}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, -1)
                          }
                          className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          disabled={isUpdating || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 font-semibold min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity, 1)
                          }
                          className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          disabled={
                            isUpdating || item.quantity >= item.book.inventory
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>

                    {item.book.inventory <= 5 && (
                      <div className="flex items-center gap-2 mt-3 text-orange-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Only {item.book.inventory} left in stock</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatPrice(Number(item.book.price) * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.book.price)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="font-semibold">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-indigo-600">
                        {formatPrice(cart.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mb-4 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <Link href="/books" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
