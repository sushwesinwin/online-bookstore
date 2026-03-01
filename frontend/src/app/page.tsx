'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InfiniteScrollCategories } from '@/components/ui/infinite-scroll-categories';
import {
  BookOpen,
  Truck,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
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
    limit: 8,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: bestsellers, isLoading: bestsellersLoading } = useBooks({
    page: 1,
    limit: 6,
    sortBy: 'price',
    sortOrder: 'desc',
  });

  // Prefetch book details on hover
  const prefetchBook = (bookId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['book', bookId],
      queryFn: () => booksApi.getBook(bookId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FCFB]">
      <main>
        {/* Hero Section - Enhanced with Animations */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B7C6B] via-[#0D8F7A] to-[#17BD8D] py-20 px-4">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFE4DB] rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>

          {/* Floating Books Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="books"
                  x="0"
                  y="0"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <text x="20" y="40" fontSize="40" fill="white" opacity="0.3">
                    📖
                  </text>
                  <text
                    x="120"
                    y="120"
                    fontSize="35"
                    fill="white"
                    opacity="0.3"
                  >
                    📕
                  </text>
                  <text x="60" y="160" fontSize="30" fill="white" opacity="0.3">
                    📘
                  </text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#books)" />
            </svg>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                  <Sparkles className="h-4 w-4 text-[#FFD700] animate-pulse" />
                  <span className="text-sm font-semibold tracking-wide">
                    LIMITED TIME OFFER
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6320] text-xs font-bold">
                    20% OFF
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Discover Your
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#FFE4DB] to-[#FFF5F2]">
                      Next Great Read
                    </span>
                    <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FF6320]/30 -z-10"></span>
                  </span>
                </h1>

                <p className="text-xl text-white/90 max-w-lg leading-relaxed">
                  Explore thousands of books across all genres. Find the perfect
                  story that speaks to you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Link href="/books">
                    <Button
                      size="lg"
                      className="bg-white text-[#0B7C6B] hover:bg-white/90 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 font-semibold px-8"
                    >
                      Explore Books
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/authors">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0B7C6B] font-semibold px-8"
                    >
                      Browse Authors
                      <BookOpen className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-white">10,000+</div>
                    <div className="text-sm text-white/70">Books Available</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">5,000+</div>
                    <div className="text-sm text-white/70">Happy Readers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">4.9★</div>
                    <div className="text-sm text-white/70">Customer Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Enhanced Book Visualization */}
              <div className="relative h-[400px] lg:h-[600px]">
                <div className="absolute inset-0">
                  {/* Stacked Books Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Book Stack */}
                    <div className="relative">
                      {/* Book 1 - Bottom */}
                      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-64 bg-gradient-to-br from-[#FF6320] to-[#FFA118] rounded-lg shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="text-white font-bold text-lg">
                            The Great Novel
                          </div>
                          <div className="w-full h-1 bg-white/30 rounded"></div>
                        </div>
                      </div>

                      {/* Book 2 - Middle */}
                      <div
                        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-48 h-64 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
                        style={{ zIndex: 2 }}
                      >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="text-white font-bold text-lg">
                            Adventure Tales
                          </div>
                          <div className="w-full h-1 bg-white/30 rounded"></div>
                        </div>
                      </div>

                      {/* Book 3 - Top */}
                      <div
                        className="absolute bottom-44 left-1/2 -translate-x-1/2 w-48 h-64 bg-gradient-to-br from-[#FFE4DB] to-[#FFF5F2] rounded-lg shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
                        style={{ zIndex: 3 }}
                      >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="text-[#0B7C6B] font-bold text-lg">
                            Mystery Series
                          </div>
                          <div className="w-full h-1 bg-[#0B7C6B]/30 rounded"></div>
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div
                        className="absolute -top-10 -right-10 animate-bounce"
                        style={{ animationDuration: '3s' }}
                      >
                        <Star className="h-8 w-8 text-[#FFD700] fill-[#FFD700]" />
                      </div>
                      <div
                        className="absolute -bottom-5 -left-10 animate-bounce"
                        style={{
                          animationDuration: '2.5s',
                          animationDelay: '0.5s',
                        }}
                      >
                        <Heart className="h-6 w-6 text-[#FF6320] fill-[#FF6320]" />
                      </div>
                      <div
                        className="absolute top-1/2 -right-16 animate-bounce"
                        style={{
                          animationDuration: '2s',
                          animationDelay: '1s',
                        }}
                      >
                        <Sparkles className="h-6 w-6 text-[#FFE4DB]" />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Circles */}
                  <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-4 border-white/20 animate-spin-slow"></div>
                  <div
                    className="absolute bottom-10 left-10 w-32 h-32 rounded-full border-4 border-white/20 animate-spin-slow"
                    style={{ animationDirection: 'reverse' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="py-8 px-4 bg-white border-b border-[#E4E9E8]">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  icon: Truck,
                  text: 'Free Shipping',
                  subtext: 'On orders over $50',
                },
                {
                  icon: Shield,
                  text: 'Secure Payment',
                  subtext: '100% protected',
                },
                {
                  icon: Award,
                  text: 'Quality Books',
                  subtext: 'Verified sellers',
                },
                {
                  icon: Heart,
                  text: 'Easy Returns',
                  subtext: '30-day guarantee',
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-3 bg-[#E4FFFB] rounded-lg">
                    <feature.icon className="h-6 w-6 text-[#0B7C6B]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#101313]">
                      {feature.text}
                    </div>
                    <div className="text-sm text-[#848785]">
                      {feature.subtext}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Books Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-[#FF6320]" />
                  <h2 className="text-3xl font-bold text-[#101313]">
                    Trending Books
                  </h2>
                </div>
                <p className="text-[#848785]">Most popular this week</p>
              </div>
              <Link href="/books/trending">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[#F4F8F8] aspect-3/4 rounded-lg mb-3" />
                    <div className="h-3 bg-[#F4F8F8] rounded mb-2" />
                    <div className="h-3 bg-[#F4F8F8] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {trendingBooks?.data.slice(0, 8).map(book => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="group cursor-pointer">
                      <div className="relative mb-3 overflow-hidden rounded-lg border border-[#E4E9E8] shadow-sm group-hover:shadow-lg transition-all">
                        <img
                          src={
                            book.imageUrl ||
                            'https://covers.openlibrary.org/b/id/10909258-L.jpg'
                          }
                          alt={book.title}
                          className="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            Hot
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-[#101313] mb-1 line-clamp-2 group-hover:text-[#0B7C6B] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#848785] mb-1">
                        {book.author}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#0B7C6B]">
                          {formatPrice(Number(book.price))}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FFA118] text-[#FFA118]" />
                          <span className="text-xs">4.5</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4 bg-[#F9FCFB]">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#101313] mb-2">
                Explore by Category
              </h2>
              <p className="text-[#848785]">Find your favorite genre</p>
            </div>

            <InfiniteScrollCategories />
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-6 w-6 text-[#FFA118]" />
                  <h2 className="text-3xl font-bold text-[#101313]">
                    Bestsellers
                  </h2>
                </div>
                <p className="text-[#848785]">Top-rated books of all time</p>
              </div>
              <Link href="/books/bestsellers">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {bestsellersLoading ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[#F4F8F8] aspect-3/4 rounded-lg mb-3" />
                    <div className="h-3 bg-[#F4F8F8] rounded mb-2" />
                    <div className="h-3 bg-[#F4F8F8] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                {bestsellers?.data.slice(0, 6).map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="group cursor-pointer">
                      <div className="relative mb-3 overflow-hidden rounded-lg border border-[#E4E9E8] shadow-sm group-hover:shadow-lg transition-all">
                        <img
                          src={
                            book.imageUrl ||
                            'https://covers.openlibrary.org/b/id/12583098-L.jpg'
                          }
                          alt={book.title}
                          className="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-[#FFA118] text-white font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center">
                          #{index + 1}
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-[#101313] mb-1 line-clamp-2 group-hover:text-[#0B7C6B] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#848785] mb-1">
                        {book.author}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#0B7C6B]">
                          {formatPrice(Number(book.price))}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FFA118] text-[#FFA118]" />
                          <span className="text-xs">4.8</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Authors Section */}
        <section className="py-16 px-4 bg-[#F9FCFB]">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#101313] mb-2">
                  Featured Authors
                </h2>
                <p className="text-[#848785]">
                  Discover books from renowned writers
                </p>
              </div>
              <Link href="/authors">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'George Orwell',
                  books: '20+ Books',
                  genre: 'Political Fiction',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/440px-George_Orwell_press_photo.jpg',
                  bio: 'Author of 1984 and Animal Farm',
                  color: 'from-[#0B7C6B] to-[#17BD8D]',
                },
                {
                  name: 'Jane Austen',
                  books: '6 Major Novels',
                  genre: 'Romance',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg/440px-CassandraAusten-JaneAusten%28c.1810%29_hires.jpg',
                  bio: 'Author of Pride and Prejudice',
                  color: 'from-[#FF6320] to-[#FFA118]',
                },
                {
                  name: 'Ernest Hemingway',
                  books: '20+ Books',
                  genre: 'Classic Literature',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/ErnestHemingway.jpg/440px-ErnestHemingway.jpg',
                  bio: 'Nobel Prize winning author',
                  color: 'from-[#219FFF] to-[#17BD8D]',
                },
                {
                  name: 'Agatha Christie',
                  books: '80+ Books',
                  genre: 'Mystery',
                  image:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Agatha_Christie_%281925%29.jpg/440px-Agatha_Christie_%281925%29.jpg',
                  bio: 'Queen of mystery novels',
                  color: 'from-[#FF4E3E] to-[#FF6320]',
                },
              ].map((author, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-6 border border-[#E4E9E8] hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative mb-4">
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${author.color} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}
                    />
                    <img
                      src={author.image}
                      alt={author.name}
                      className="relative w-32 h-32 mx-auto object-cover rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-[#101313] group-hover:text-[#0B7C6B] transition-colors">
                      {author.name}
                    </h3>
                    <p className="text-sm text-[#848785]">{author.books}</p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r ${author.color} text-white`}
                    >
                      {author.genre}
                    </div>
                    <p className="text-sm text-[#848785] pt-2">{author.bio}</p>
                  </div>

                  <Link href={`/authors/${encodeURIComponent(author.name)}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Books
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 px-4 bg-linear-to-br from-[#0B7C6B] to-[#17BD8D]">
          <div className="container mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-lg text-white/90">
                Get exclusive deals, new arrivals, and reading recommendations
                delivered to your inbox
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border-1 focus:ring-2 focus:ring-white/50 outline-none"
                />
                <Button
                  size="lg"
                  variant="default"
                  className="whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </div>

              <p className="text-sm text-white/70">
                Join 50,000+ book lovers. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-green-950 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-[#0B7C6B]" />
                <span className="font-bold text-dark text-xl">Bookstore</span>
              </div>
              <p className="text-sm">
                Your trusted source for books. Discover, read, and grow with us.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-xl text-dark mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/books"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    All Books
                  </Link>
                </li>
                <li>
                  <Link
                    href="/books/trending"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Trending
                  </Link>
                </li>
                <li>
                  <Link
                    href="/books/bestsellers"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Bestsellers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/books/new-arrivals"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xl text-dark mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-xl text-dark mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#383A3A] pt-8 text-center text-sm">
            <p>
              &copy; 2024 Bookstore. All rights reserved. Made with ❤️ for book
              lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
