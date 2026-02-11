'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BookCard } from '@/components/books/book-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBooks, useCategories } from '@/lib/hooks/use-books';
import { BookQueryParams } from '@/lib/api/types';
import { Search, Filter } from 'lucide-react';

export default function BooksPage() {
    const searchParams = useSearchParams();

    const [params, setParams] = useState<BookQueryParams>({
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    // Initialize params from URL query parameters
    useEffect(() => {
        const urlParams: BookQueryParams = {
            page: 1,
            limit: 12,
            sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
            sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
        };

        if (searchParams.get('author')) {
            urlParams.author = searchParams.get('author')!;
        }
        if (searchParams.get('category')) {
            urlParams.category = searchParams.get('category')!;
        }
        if (searchParams.get('search')) {
            urlParams.search = searchParams.get('search')!;
        }

        setParams(urlParams);
    }, [searchParams]);

    const { data, isLoading } = useBooks(params);
    const { data: categories } = useCategories();

    const handleSearch = (search: string) => {
        setParams((prev) => ({ ...prev, search, page: 1 }));
    };

    const handleCategoryFilter = (category: string) => {
        setParams((prev) => ({
            ...prev,
            category: prev.category === category ? undefined : category,
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }));
    };

    const clearFilters = () => {
        setParams({
            page: 1,
            limit: 12,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Browse Books</h1>

                    {/* Active Filters Display */}
                    {(params.author || params.category) && (
                        <div className="mb-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {params.author && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    Author: {params.author}
                                </span>
                            )}
                            {params.category && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                    Category: {params.category}
                                </span>
                            )}
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search books by title, author, or ISBN..."
                                className="pl-10"
                                value={params.search || ''}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-2 border rounded-md"
                            value={params.sortBy}
                            onChange={(e) => setParams((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                        >
                            <option value="createdAt">Newest</option>
                            <option value="title">Title</option>
                            <option value="author">Author</option>
                            <option value="price">Price</option>
                        </select>

                        <select
                            className="px-4 py-2 border rounded-md"
                            value={params.sortOrder}
                            onChange={(e) => setParams((prev) => ({ ...prev, sortOrder: e.target.value as any }))}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {/* Category Filters */}
                    {categories && categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={params.category === category ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleCategoryFilter(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Books Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
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
                            {data.data.map((book) => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.meta.totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(params.page! - 1)}
                                    disabled={!data.meta.hasPreviousPage}
                                >
                                    Previous
                                </Button>

                                <span className="flex items-center px-4">
                                    Page {data.meta.page} of {data.meta.totalPages}
                                </span>

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
                        <p className="text-lg mb-2">No books found</p>
                        {(params.search || params.author || params.category) && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear filters and try again
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
