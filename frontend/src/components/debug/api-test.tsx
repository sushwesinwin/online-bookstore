'use client';

import { useBooks } from '@/lib/hooks/use-books';
import { useEffect } from 'react';

export function ApiTest() {
    const trending = useBooks({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const bestsellers = useBooks({
        page: 1,
        limit: 4,
        sortBy: 'price',
        sortOrder: 'desc',
    });

    useEffect(() => {
        console.log('=== API DEBUG INFO ===');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
        console.log('Trending:', {
            isLoading: trending.isLoading,
            isError: trending.isError,
            error: trending.error,
            data: trending.data,
        });
        console.log('Bestsellers:', {
            isLoading: bestsellers.isLoading,
            isError: bestsellers.isError,
            error: bestsellers.error,
            data: bestsellers.data,
        });
    }, [trending, bestsellers]);

    return (
        <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
            <h3 className="font-bold mb-2">API Debug</h3>
            <div className="space-y-2">
                <div>
                    <strong>Trending:</strong>{' '}
                    {trending.isLoading ? '⏳ Loading...' : trending.isError ? '❌ Error' : `✅ ${trending.data?.data.length || 0} books`}
                </div>
                <div>
                    <strong>Bestsellers:</strong>{' '}
                    {bestsellers.isLoading ? '⏳ Loading...' : bestsellers.isError ? '❌ Error' : `✅ ${bestsellers.data?.data.length || 0} books`}
                </div>
                {trending.isError && (
                    <div className="text-red-400 text-xs mt-2">
                        Error: {(trending.error as any)?.message || 'Unknown error'}
                    </div>
                )}
            </div>
        </div>
    );
}
