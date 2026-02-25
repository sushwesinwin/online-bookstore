'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBook } from '@/lib/hooks/use-books';
import { useAddToCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Check,
  BookOpen,
  Award,
} from 'lucide-react';
import { useState } from 'react';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const { data: book, isLoading } = useBook(bookId);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<
    'description' | 'details' | 'reviews'
  >('description');

  const handleAddToCart = () => {
    if (isAuthenticated && book) {
      addToCart({ bookId: book.id, quantity });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Book not found
          </h1>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for demo (replace with real data from API)
  const rating = 4.5;
  const reviewCount = 2847;
  const inStock = book.inventory > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-indigo-600">
                Home
              </Link>
              <span>/</span>
              <Link href="/books" className="hover:text-indigo-600">
                Books
              </Link>
              <span>/</span>
              <Link
                href={`/books?category=${book.category}`}
                className="hover:text-indigo-600"
              >
                {book.category}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{book.title}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/books"
            className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Books
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
                <div className="relative">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full max-w-md mx-auto aspect-[3/4] object-cover rounded-xl shadow-2xl"
                    />
                  ) : (
                    <div className="w-full max-w-md mx-auto aspect-[3/4] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-32 w-32 text-white" />
                    </div>
                  )}

                  {/* Badges */}
                  {!inStock && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Out of Stock
                    </div>
                  )}

                  {inStock && book.inventory < 10 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Only {book.inventory} left
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Category Badge */}
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                {book.category}
              </Badge>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {book.title}
              </h1>

              {/* Author */}
              <p className="text-xl text-gray-600">
                by{' '}
                <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                  {book.author}
                </span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{rating}</span>
                <span className="text-gray-600">
                  ({reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-indigo-600">
                    {formatPrice(book.price)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(book.price * 1.2)}
                  </span>
                  <Badge variant="destructive" className="text-sm">
                    Save 20%
                  </Badge>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300 font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(book.inventory, quantity + 1))
                      }
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= book.inventory}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {book.inventory} available
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleAddToCart}
                  disabled={!isAuthenticated || !inStock || isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isPending
                    ? 'Adding...'
                    : inStock
                      ? 'Add to Cart'
                      : 'Out of Stock'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-center text-gray-600 mt-3">
                    <Link
                      href="/login"
                      className="text-indigo-600 hover:underline"
                    >
                      Sign in
                    </Link>{' '}
                    to purchase
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% protected</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day policy</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Quality Assured</p>
                    <p className="text-xs text-gray-600">Authentic books</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b mb-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'details', label: 'Details' },
                { id: 'reviews', label: 'Reviews' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`pb-4 px-2 font-semibold transition-colors relative ${
                    selectedTab === tab.id
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {selectedTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="prose max-w-none">
              {selectedTab === 'description' && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {book.description ||
                      'Discover this captivating book that takes you on an unforgettable journey. With masterful storytelling and rich character development, this work stands as a testament to literary excellence.'}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Perfect for readers who appreciate depth, nuance, and
                    compelling narratives that stay with you long after the
                    final page.
                  </p>
                </div>
              )}

              {selectedTab === 'details' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">ISBN</span>
                      <span className="text-gray-600">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">
                        Author
                      </span>
                      <span className="text-gray-600">{book.author}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">
                        Category
                      </span>
                      <span className="text-gray-600">{book.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">Price</span>
                      <span className="text-gray-600">
                        {formatPrice(book.price)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">
                        Publisher
                      </span>
                      <span className="text-gray-600">Premium Books Inc.</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">
                        Language
                      </span>
                      <span className="text-gray-600">English</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">Pages</span>
                      <span className="text-gray-600">352</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-semibold text-gray-700">
                        Format
                      </span>
                      <span className="text-gray-600">Paperback</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-indigo-600 mb-2">
                          {rating}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          {reviewCount.toLocaleString()} reviews
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm w-12">{stars} star</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{
                                  width: `${stars === 5 ? 70 : stars === 4 ? 20 : 5}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {stars === 5 ? '70%' : stars === 4 ? '20%' : '5%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  {[
                    {
                      name: 'Sarah Johnson',
                      rating: 5,
                      date: '2 days ago',
                      comment:
                        'Absolutely loved this book! The storytelling is masterful and kept me engaged from start to finish.',
                    },
                    {
                      name: 'Michael Chen',
                      rating: 5,
                      date: '1 week ago',
                      comment:
                        "One of the best books I've read this year. Highly recommend to anyone who enjoys this genre.",
                    },
                    {
                      name: 'Emma Williams',
                      rating: 4,
                      date: '2 weeks ago',
                      comment:
                        'Great read overall. Some parts were a bit slow, but the ending made up for it.',
                    },
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.date}
                            </span>
                          </div>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Books */}
          <div>
            <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Link key={i} href={`/books/${i}`} className="group">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-indigo-600">
                        Related Book {i}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">Author Name</p>
                      <p className="text-lg font-bold text-indigo-600">
                        $19.99
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-20">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Online Bookstore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
