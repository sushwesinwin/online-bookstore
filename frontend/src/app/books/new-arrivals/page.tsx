'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BookCard } from '@/components/books/book-card';
import { Button } from '@/components/ui/button';
import { useBooks } from '@/lib/hooks/use-books';
import { BookQueryParams } from '@/lib/api/types';
import { Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function NewArrivalsPage() {
  const [params, setParams] = useState<BookQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading } = useBooks(params);

  const handlePageChange = (page: number) => {
    setParams(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filter: Partial<BookQueryParams>) => {
    setParams(prev => ({ ...prev, ...filter, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">New Arrivals</h1>
              <p className="text-gray-600 mt-1">
                Latest books added to our collection
              </p>
            </div>
          </div>

          {/* Stats and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {data && (
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {data.meta.total}
                  </span>
                  <span>new books</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Updated daily</span>
                </div>
              </div>
            )}

            {/* Filter Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Button
                variant={params.inStock === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange({ inStock: undefined })}
              >
                All Books
              </Button>
              <Button
                variant={params.inStock === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange({ inStock: true })}
              >
                In Stock Only
              </Button>
            </div>
          </div>
        </div>

        {/* Featured New Arrival Banner */}
        {data && data.data.length > 0 && params.page === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-indigo-100">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  ✨ Featured
                </div>
                <img
                  src={
                    data.data[0].imageUrl ||
                    'https://covers.openlibrary.org/b/id/12668456-L.jpg'
                  }
                  alt={data.data[0].title}
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>Newest Addition</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {data.data[0].title}
                </h2>
                <p className="text-xl text-gray-600 mb-4">
                  {data.data[0].author}
                </p>
                <p className="text-gray-700 mb-6 line-clamp-3">
                  {data.data[0].description ||
                    "A captivating new release you won't want to miss. Discover this latest addition to our collection."}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-indigo-600">
                    {formatPrice(Number(data.data[0].price))}
                  </span>
                  <Link href={`/books/${data.data[0].id}`}>
                    <Button size="lg">View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {index === 0 && params.page === 1 ? null : (
                    <>
                      {index < 5 && (
                        <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          New
                        </div>
                      )}
                      <BookCard book={book} />
                    </>
                  )}
                  {index === 0 && params.page === 1 && (
                    <div className="hidden" />
                  )}
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
                        variant={
                          params.page === pageNum ? 'default' : 'outline'
                        }
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
                        variant={
                          params.page === data.meta.totalPages
                            ? 'default'
                            : 'outline'
                        }
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
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No new arrivals found</p>
          </div>
        )}
      </main>
    </div>
  );
}
