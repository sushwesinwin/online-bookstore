'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils';
import { useAddToCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addToCart({ bookId: book.id, quantity: 1 });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <Link href={`/books/${book.id}`}>
          <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4 flex items-center justify-center">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <span className="text-gray-500">No image</span>
            )}
          </div>
        </Link>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {book.category}
          </Badge>

          <Link href={`/books/${book.id}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-gray-700 transition-colors">
              {book.title}
            </h3>
          </Link>

          <p className="text-sm text-gray-600">{book.author}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatPrice(book.price)}</span>
            {book.inventory > 0 ? (
              <span className="text-xs text-gray-600">
                {book.inventory} in stock
              </span>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Out of stock
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!isAuthenticated || book.inventory === 0 || isPending}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isPending ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
