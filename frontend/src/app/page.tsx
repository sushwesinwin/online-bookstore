'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import {
  BookOpen,
  Truck,
  Shield,
  Star,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { useBooks } from '@/lib/hooks/use-books';
import { formatPrice } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/books';

export default function HomePage() {
  const queryClient = useQueryClient();

  // Fetch books for different sections
  const { data: trendingBooks, isLoading: trendingLoading } = useBooks({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bestsellers, isLoading: bestsellersLoading } = useBooks({
    page: 1,
    limit: 4,
    sortBy: 'price',
    sortOrder: 'desc',
  });

  const { data: newBooks, isLoading: newBooksLoading } = useBooks({
    page: 1,
    limit: 3,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Prefetch book details on hover for better UX
  const prefetchBook = (bookId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['book', bookId],
      queryFn: () => booksApi.getBook(bookId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main>
        {/* Hero Section with Background Image */}
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000')",
            }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/70" />

          <div className="container relative mx-auto px-4 py-24 md:py-32">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/20">
                <Sparkles className="h-4 w-4" />
                <span>Over 10,000+ Books Available</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
                Discover Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Next Great Read
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-200 leading-relaxed mb-8">
                Explore our curated collection of bestsellers, classics, and hidden gems.
                From fiction to non-fiction, find books that inspire, educate, and entertain.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/books">
                  <Button size="lg" className="text-base px-8 py-6 bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                    Browse Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 border-white text-gray-900 hover:bg-white/10 backdrop-blur-sm">
                    Sign Up Free
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-300">Books</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-gray-300">Readers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.9</div>
                  <div className="text-sm text-gray-300">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Books Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Trending Now</h2>
                <p className="text-gray-600">Most popular books this week</p>
              </div>
              <Link href="/books/trending">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {trendingBooks?.data.map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="group cursor-pointer">
                      <div className="relative mb-4 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow">
                        <img
                          src={book.imageUrl || 'https://covers.openlibrary.org/b/id/10909258-L.jpg'}
                          alt={book.title}
                          className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {index < 3 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            🔥 Hot
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-600">{formatPrice(Number(book.price))}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.5</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold mb-2">Bestsellers</h2>
                <p className="text-gray-600">Top-rated books of all time</p>
              </div>
              <Link href="/books/bestsellers">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {bestsellersLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl shadow-lg p-6">
                    <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {bestsellers?.data.map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                      <div className="relative">
                        <img
                          src={book.imageUrl || 'https://covers.openlibrary.org/b/id/12583098-L.jpg'}
                          alt={book.title}
                          className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                          #{index + 1}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{book.author}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-indigo-600">{formatPrice(Number(book.price))}</span>
                          <span className="text-sm text-gray-500">{book.inventory > 0 ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                        <Button className="w-full">Add to Cart</Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Famous Authors Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Famous Authors</h2>
              <p className="text-xl text-gray-600">Discover books from renowned writers</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Stephen King',
                  books: '60+ Books',
                  genre: 'Horror & Thriller',
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                  bio: 'Master of horror and suspense'
                },
                {
                  name: 'J.K. Rowling',
                  books: '15+ Books',
                  genre: 'Fantasy',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
                  bio: 'Creator of Harry Potter universe'
                },
                {
                  name: 'Agatha Christie',
                  books: '80+ Books',
                  genre: 'Mystery',
                  image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
                  bio: 'Queen of mystery novels'
                },
                {
                  name: 'Ernest Hemingway',
                  books: '20+ Books',
                  genre: 'Classic Literature',
                  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
                  bio: 'Nobel Prize winning author'
                }
              ].map((author, index) => (
                <div key={index} className="group text-center">
                  <div className="relative mb-6 mx-auto w-48 h-48">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <img
                      src={author.image}
                      alt={author.name}
                      className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{author.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{author.books}</p>
                  <p className="text-sm text-indigo-600 font-medium mb-2">{author.genre}</p>
                  <p className="text-sm text-gray-500 mb-4">{author.bio}</p>
                  <Link href={`/books?author=${encodeURIComponent(author.name)}`}>
                    <Button variant="outline" size="sm">View Books</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="text-center flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span>New Arrivals</span>
                </div>
                <h2 className="text-4xl font-bold mb-2">Coming Soon</h2>
                <p className="text-xl text-gray-600">Be the first to read these upcoming releases</p>
              </div>
              <Link href="/books/new-arrivals">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {newBooksLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl shadow-xl p-6">
                    <div className="bg-gray-200 aspect-[4/5] rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newBooks?.data.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                      <div className="relative">
                        <img
                          src={book.imageUrl || 'https://covers.openlibrary.org/b/id/12668456-L.jpg'}
                          alt={book.title}
                          className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          New Arrival
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{book.category || 'Fiction'}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{book.author}</p>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description || 'A captivating new release you won\'t want to miss'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-indigo-600">{formatPrice(Number(book.price))}</span>
                          <Button>View Details</Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section - Modern Cards */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Readers Choose Us</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the best in online book shopping with our premium features
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: 'Vast Collection',
                  description: '10,000+ books across all genres, from bestsellers to rare finds',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Truck,
                  title: 'Fast Delivery',
                  description: 'Free shipping on orders over $50. Get your books in 2-3 days',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Shield,
                  title: 'Secure Payment',
                  description: 'Bank-level encryption and secure checkout for peace of mind',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Award,
                  title: 'Quality Guarantee',
                  description: '30-day return policy. Love it or get your money back',
                  color: 'from-orange-500 to-red-500'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />

                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore by Category</h2>
              <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Fiction', emoji: '📚', color: 'from-blue-500 to-blue-600' },
                { name: 'Mystery', emoji: '🔍', color: 'from-purple-500 to-purple-600' },
                { name: 'Romance', emoji: '💕', color: 'from-pink-500 to-pink-600' },
                { name: 'Sci-Fi', emoji: '🚀', color: 'from-indigo-500 to-indigo-600' },
                { name: 'Biography', emoji: '👤', color: 'from-green-500 to-green-600' },
                { name: 'Business', emoji: '💼', color: 'from-orange-500 to-orange-600' }
              ].map((category, index) => (
                <Link key={index} href={`/books?category=${category.name}`}>
                  <div className="group relative bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                    <div className="text-4xl mb-3">{category.emoji}</div>
                    <div className="font-semibold text-gray-900">{category.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Readers Worldwide</h2>
              <p className="text-xl text-gray-600">Join thousands of happy book lovers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "The best online bookstore I've ever used. Fast delivery and amazing selection!",
                  author: "Sarah Johnson",
                  role: "Book Enthusiast",
                  rating: 5
                },
                {
                  quote: "I love how easy it is to find exactly what I'm looking for. Highly recommended!",
                  author: "Michael Chen",
                  role: "Regular Customer",
                  rating: 5
                },
                {
                  quote: "Great prices, excellent service, and the books always arrive in perfect condition.",
                  author: "Emma Williams",
                  role: "Avid Reader",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Premium */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

          <div className="container relative mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Start Your Reading Journey Today
              </h2>
              <p className="text-xl text-indigo-100">
                Join over 50,000 readers and get access to exclusive deals, personalized recommendations, and more
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/books">
                  <Button size="lg" variant="secondary" className="text-base px-8 py-6 bg-white text-indigo-600 hover:bg-gray-100">
                    Browse Books
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 border-white text-gray-900 hover:bg-white/10">
                    Create Free Account
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-8 pt-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">50K+ Members</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                <span className="font-bold text-white text-xl">Bookstore</span>
              </div>
              <p className="text-sm text-gray-400">
                Your trusted source for books since 2024. Discover, read, and grow.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/books" className="hover:text-white transition-colors">All Books</Link></li>
                <li><Link href="/books?category=Fiction" className="hover:text-white transition-colors">Fiction</Link></li>
                <li><Link href="/books?category=Non-Fiction" className="hover:text-white transition-colors">Non-Fiction</Link></li>
                <li><Link href="/books?inStock=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Online Bookstore. All rights reserved. Made with ❤️ for book lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
