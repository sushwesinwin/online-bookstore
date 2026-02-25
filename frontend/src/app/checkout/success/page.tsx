'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useCartStore } from '@/lib/stores/cart-store';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { clearCart: clearCartStore } = useCartStore();
    const sessionId = searchParams.get('session_id');
    const [countdown, setCountdown] = useState(10);
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<{ orderId: string; orderNumber: string } | null>(null);
    const hasFulfilled = useRef(false);

    useEffect(() => {
        if (!sessionId || hasFulfilled.current) return;
        hasFulfilled.current = true;

        const fulfill = async () => {
            try {
                // Verify payment with Stripe and create order if needed
                const result = await ordersApi.verifySession(sessionId);
                setOrderInfo(result);

                // Clear cart locally and in server cache
                clearCartStore();
                queryClient.setQueryData(['cart'], null);
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                queryClient.invalidateQueries({ queryKey: ['my-orders'] });
                queryClient.invalidateQueries({ queryKey: ['orders'] });

                setIsProcessing(false);
            } catch (err: any) {
                const msg = err?.response?.data?.message || 'Something went wrong verifying your order.';
                setError(msg);
                setIsProcessing(false);
            }
        };

        fulfill();
    }, [sessionId, queryClient, clearCartStore]);

    // Countdown timer — starts after processing is done
    useEffect(() => {
        if (isProcessing || error) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/orders');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isProcessing, error, router]);

    return (
        <div className="min-h-screen bg-[#F9FCFB]">
            <Header />

            <main className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-[#E4E9E8]">

                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                {!error && (
                                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                                )}
                                <div className={`relative rounded-full p-8 shadow-xl ${error ? 'bg-red-500' : 'bg-[#0B7C6B]'}`}>
                                    {error
                                        ? <AlertCircle className="h-16 w-16 text-white" />
                                        : <CheckCircle className="h-16 w-16 text-white" />
                                    }
                                </div>
                            </div>
                        </div>

                        {error ? (
                            <>
                                <h1 className="text-4xl font-bold text-[#101313] mb-4">Something went wrong</h1>
                                <p className="text-lg text-[#848785] mb-8">{error}</p>
                                <p className="text-sm text-[#848785] mb-8">
                                    Your payment may still have been processed. Please check your email or contact support.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/orders">
                                        <Button size="lg" className="w-full bg-[#0B7C6B] hover:bg-[#0D8F7A] shadow-xl transition-all h-14 text-lg font-bold">
                                            <Package className="mr-2 h-5 w-5" />
                                            Check My Orders
                                        </Button>
                                    </Link>
                                    <Link href="/books">
                                        <Button variant="outline" size="lg" className="w-full h-14 text-lg font-bold border-[#E4E9E8]">
                                            Browse Books
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Success Message */}
                                <h1 className="text-4xl font-bold text-[#101313] mb-4">
                                    Payment Confirmed!
                                </h1>
                                <p className="text-lg text-[#848785] mb-8">
                                    Thank you for your purchase. Your order has been placed successfully.
                                </p>

                                {sessionId && (
                                    <div className="bg-[#F4F8F8] rounded-2xl p-4 mb-8 border border-[#E4E9E8]">
                                        <p className="text-xs font-bold text-[#848785] uppercase tracking-wider mb-2">Transaction Reference</p>
                                        <p className="text-sm font-mono text-[#101313] break-all">{sessionId}</p>
                                    </div>
                                )}

                                {/* Order status box */}
                                <div className="bg-linear-to-br from-[#E4FFFB] to-[#F0FFF4] rounded-2xl p-8 mb-8 border border-[#0B7C6B]/10">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        {isProcessing ? (
                                            <Loader2 className="h-6 w-6 text-[#0B7C6B] animate-spin" />
                                        ) : (
                                            <Package className="h-6 w-6 text-[#0B7C6B]" />
                                        )}
                                        <h2 className="text-xl font-bold text-[#101313]">
                                            {isProcessing ? 'Finalizing your order...' : 'Order Placed Successfully'}
                                        </h2>
                                    </div>
                                    {orderInfo && (
                                        <p className="text-[#0B7C6B] font-semibold">
                                            Order #{orderInfo.orderNumber}
                                        </p>
                                    )}
                                    <p className="text-[#848785] leading-relaxed mt-2">
                                        {isProcessing
                                            ? "We're just finishing up your order details..."
                                            : "You'll receive a confirmation email with all the details shortly."}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/orders">
                                        <Button size="lg" className="w-full bg-[#0B7C6B] hover:bg-[#0D8F7A] shadow-xl hover:shadow-2xl transition-all h-14 text-lg font-bold">
                                            <Package className="mr-2 h-5 w-5" />
                                            My Orders
                                        </Button>
                                    </Link>

                                    <Link href="/books">
                                        <Button variant="outline" size="lg" className="w-full h-14 text-lg font-bold border-[#E4E9E8]">
                                            Keep Shopping
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* Auto Redirect Notice */}
                                {!isProcessing && (
                                    <div className="mt-12 pt-8 border-t border-[#E4E9E8]">
                                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#848785]">
                                            <Loader2 className="h-4 w-4 animate-spin text-[#0B7C6B]" />
                                            <span>Taking you to your orders in {countdown} seconds...</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
