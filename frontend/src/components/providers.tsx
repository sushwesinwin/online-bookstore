'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { CartInitializer } from './cart/cart-initializer';

import { StripeProvider } from './providers/stripe-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data is considered fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,

                        // Cache data for 10 minutes before garbage collection
                        gcTime: 10 * 60 * 1000,

                        // Refetch on window focus for real-time updates
                        refetchOnWindowFocus: true,

                        // Refetch on reconnect
                        refetchOnReconnect: true,

                        // Retry failed requests 3 times
                        retry: 3,

                        // Exponential backoff for retries
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        // Retry mutations once on failure
                        retry: 1,

                        // Show error for 5 seconds
                        gcTime: 5000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <StripeProvider>
                <CartInitializer />
                {children}
                <Toaster position="top-right" richColors closeButton />
            </StripeProvider>
            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            )}
        </QueryClientProvider>
    );
}
