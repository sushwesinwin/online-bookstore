'use client';

import { BookCard } from '@/components/books/book-card';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading } = useFavorites(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>
        <p className="text-gray-600 mb-8">
          Please log in to view your favorite books.
        </p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

      {favorites?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            You haven&apos;t added any favorite books yet.
          </p>
          <Button asChild variant="outline">
            <Link href="/books">Browse Books</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites?.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
