'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Redirect to orders page after 10 seconds
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
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        {/* Success Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-green-500 rounded-full p-6">
                                    <CheckCircle className="h-16 w-16 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Payment Successful!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Thank you for your order. Your payment has been processed successfully.
                        </p>

                        {sessionId && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-8">
                                <p className="text-sm text-gray-500 mb-1">Session ID</p>
                                <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
                            </div>
                        )}

                        {/* Order Details */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <Package className="h-6 w-6 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-gray-900">What's Next?</h2>
                            </div>
                            <p className="text-gray-700">
                                You will receive an order confirmation email shortly. Your order is being processed and will be shipped soon.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Link href="/orders">
                                <Button size="lg" className="w-full shadow-lg hover:shadow-xl transition-all">
                                    <Package className="mr-2 h-5 w-5" />
                                    View My Orders
                                </Button>
                            </Link>

                            <Link href="/books">
                                <Button variant="outline" size="lg" className="w-full">
                                    Continue Shopping
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Auto Redirect Notice */}
                        <div className="mt-8 pt-8 border-t">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Redirecting to orders in {countdown} seconds...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
