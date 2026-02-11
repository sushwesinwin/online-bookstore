'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BookCard } from '@/components/books/book-card';
import { Button } from '@/components/ui/button';
import { useBooks } from '@/lib/hooks/use-books';
import { BookQueryParams } from '@/lib/api/types';
import { Award, ArrowLeft, Star } from 'lucide-react';

export default function BestsellersPage() {
    const [params, setParams] = useState<BookQueryParams>({
        page: 1,
        limit: 20,
        sortBy: 'price',
        sortOrder: 'desc',
    });

    const { data, isLoading } = useBooks(params);

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (sortBy: string) => {
        setParams((prev) => ({ ...prev, sortBy: sortBy as any, page: 1 }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Header />

            <main className="container mx-auto py-8 px-4">
                {/* Header Section */}
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="outline" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                            <Award className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Bestsellers</h1>
                            <p className="text-gray-600 mt-1">Top-rated books of all time</p>
                        </div>
                    </div>

                    {/* Stats and Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {data && (
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{data.meta.total}</span>
                                    <span>bestselling books</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>Highly rated</span>
                                </div>
                            </div>
                        )}

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Sort by:</span>
                            <select
                                className="px-3 py-2 border rounded-md text-sm"
                                value={params.sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="price">Price (High to Low)</option>
                                <option value="title">Title</option>
                                <option value="author">Author</option>
                                <option value="createdAt">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : data && data.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {data.data.map((book, index) => (
                                <div key={book.id} className="relative">
                                    {index < 10 && (
                                        <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-sm font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                            #{index + 1}
                                        </div>
                                    )}
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.meta.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(params.page! - 1)}
                                    disabled={!data.meta.hasPreviousPage}
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {[...Array(Math.min(5, data.meta.totalPages))].map((_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={params.page === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    {data.meta.totalPages > 5 && (
                                        <>
                                            <span className="text-gray-400">...</span>
                                            <Button
                                                variant={params.page === data.meta.totalPages ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(data.meta.totalPages)}
                                            >
                                                {data.meta.totalPages}
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(params.page! + 1)}
                                    disabled={!data.meta.hasNextPage}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No bestsellers found</p>
                    </div>
                )}
            </main>
        </div>
    );
}
