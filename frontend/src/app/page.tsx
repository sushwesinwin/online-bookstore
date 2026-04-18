'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Star,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Award,
  Brain,
} from 'lucide-react';
import { useBooks } from '@/lib/hooks/use-books';
import { formatPrice } from '@/lib/utils';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/books';
import { quotesApi } from '@/lib/api/quotes';
import { FEATURED_AUTHOR_PROFILES, getAuthorHref } from '@/lib/authors';

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
    limit: 3,
    sortBy: 'price',
    sortOrder: 'desc',
  });

  const { data: authorCatalog } = useBooks({
    page: 1,
    limit: 100,
    sortBy: 'author',
    sortOrder: 'asc',
  });

  // Fetch random quote
  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ['randomQuote'],
    queryFn: quotesApi.getRandomQuote,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prefetch book details on hover
  const prefetchBook = (bookId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['book', bookId],
      queryFn: () => booksApi.getBook(bookId),
      staleTime: 5 * 60 * 1000,
    });
  };

  const featuredAuthors = useMemo(() => {
    const catalogCounts = new Map<string, number>();

    authorCatalog?.data.forEach(book => {
      const count = catalogCounts.get(book.author) ?? 0;
      catalogCounts.set(book.author, count + 1);
    });

    return FEATURED_AUTHOR_PROFILES.map(author => ({
      ...author,
      catalogCount: catalogCounts.get(author.name) ?? 0,
    }));
  }, [authorCatalog]);

  return (
    <div className="min-h-screen bg-[#F9FCFB] font-light">
      <main>
        {/* Hero Section - Enhanced with Animations */}
        <section className="relative overflow-hidden bg-[#F9FCFB] min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-6 px-4 border-b border-gray-100/50">
          <div className="container mx-auto relative w-full max-w-6xl flex flex-col items-center">
            {/* Top Center Title */}
            <div className="animate-fade-in flex flex-col items-center w-full z-30 mb-8 lg:mb-2 relative pointer-events-none">
              <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold leading-none text-[#1D1D1F] tracking-tighter flex flex-col text-center">
                <span>Where Stories</span>
                <span className="relative flex items-center justify-center gap-2 md:gap-4 mt-2">
                  Come to Light
                  <Sparkles
                    className="h-8 w-8 md:h-12 md:w-12 text-[#FFD700] shrink-0 animate-pulse"
                    fill="#FFD700"
                  />
                </span>
              </h1>
            </div>

            {/* Middle Section: 3-column Floating Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 w-full items-center gap-8 lg:gap-6 relative mt-0">
              {/* Left Side Floating Text */}
              <div className="md:col-span-3 flex flex-col items-start text-left gap-3 order-2 md:order-1 z-20 px-4 md:px-0">
                <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-snug">
                  <strong className="text-black font-semibold">Discover</strong>{' '}
                  books that{' '}
                  <strong className="text-black font-semibold">
                    inspire, comfort,
                  </strong>{' '}
                  and stay with you.
                </p>
                <Link
                  href="/books"
                  className="group uppercase font-black text-[10px] md:text-[11px] tracking-[0.2em] text-gray-500 border-b-2 border-transparent hover:border-black hover:text-black transition-colors mt-1 flex items-center gap-2 pb-1 relative"
                >
                  EXPLORE BOOKS
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute bottom-0 left-0 w-8 border-b-2 border-black group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>

              {/* Center Image */}
              <div className="md:col-span-6 flex justify-center order-1 md:order-2 z-10 relative">
                <Image
                  src="/hero.svg"
                  alt="Lumora Hero Illustration"
                  width={600}
                  height={600}
                  priority
                  className="w-full max-w-xs md:max-w-max lg:max-w-lg max-h-[30vh] md:max-h-[35vh] lg:max-h-[45vh] object-contain drop-shadow-2xl animate-fade-in animate-fade-in-delay-200"
                />
              </div>

              {/* Right Side Floating Text */}
              <div className="md:col-span-3 flex flex-col items-start text-left gap-3 order-3 z-20 px-4 md:px-0 md:mb-12">
                <div className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full border-4 border-[#F9FCFB] bg-white shadow-xl flex items-center justify-center group hover:scale-105 transition-transform duration-500 mb-1 lg:mb-0">
                  <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-[#0B7C6B]" />
                </div>
                <p className="text-sm lg:text-base text-gray-500 leading-relaxed pl-3 border-l-2 border-gray-300">
                  <strong className="text-black font-semibold">
                    Enlighten
                  </strong>{' '}
                  yourself, gain insight, and explore brilliant minds.
                </p>
                <Link
                  href="/authors"
                  className="group uppercase font-black text-[10px] md:text-[11px] tracking-[0.2em] text-gray-500 border-b-2 border-transparent hover:border-black hover:text-black transition-colors mt-1 flex items-center gap-2 pb-1 relative"
                >
                  BROWSE AUTHORS
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute bottom-0 left-0 w-8 border-b-2 border-black group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer z-20">
            <button
              onClick={() => {
                document
                  .getElementById('trending')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-3 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-gray-300 shadow-sm hover:shadow-md transition-all"
              aria-label="Scroll down"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Trending Books Section */}
        <section id="trending" className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="flex flex-col gap-6 md:max-w-xl">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-12 bg-orange-500/30" />
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black tracking-[0.3em] uppercase border-orange-200 text-[#FF6320] px-3 py-1 bg-orange-50/50"
                  >
                    WEEKLY TOP 8
                  </Badge>
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter leading-[0.9]">
                  Trending <br />
                  <span className="text-gray-300">Books.</span>
                </h2>
              </div>
              <Link href="/books/trending">
                <Button
                  variant="outline"
                  className="rounded-full border-black/10 hover:border-black hover:bg-black hover:text-white transition-all duration-500 group font-bold text-sm h-14 px-10 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  View full collection
                  <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                {trendingBooks?.data.slice(0, 8).map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                    className="group relative"
                  >
                    {/* Rank Number Overlay */}
                    <div className="absolute -top-6 -left-2 z-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 select-none">
                      <span className="text-[8rem] font-serif font-black text-black leading-none italic italic-f">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="relative z-10 cursor-pointer">
                      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-gray-50 aspect-[3/4.2] shadow-sm group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-700 group-hover:-translate-y-3">
                        <Image
                          src={
                            book.imageUrl ||
                            'https://covers.openlibrary.org/b/id/10909258-L.jpg'
                          }
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 12vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <Badge className="bg-white/95 backdrop-blur-md text-black border-none font-black text-[10px] tracking-tighter shadow-xl px-4 py-1.5 rounded-full">
                            TOP {index + 1}
                          </Badge>
                        </div>

                        {/* Quick View / Price Glassmorphism */}
                        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-75">
                          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10">
                            <span className="text-white text-sm font-bold">
                              {formatPrice(Number(book.price))}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-white text-[11px] font-black tracking-tighter">
                                4.8
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-center">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-black transition-colors leading-tight px-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-20 px-4 bg-[#F9FCFB]">
          <div className="container mx-auto max-w-5xl">
            {quoteLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
              </div>
            ) : quote ? (
              <div className="relative">
                {/* Quote Mark Decoration */}
                <div className="absolute -top-8 left-0 text-[10rem] md:text-[12rem] font-serif text-[#0B7C6B]/5 leading-none select-none pointer-events-none">
                  &ldquo;
                </div>

                <div className="relative z-10 text-center space-y-8 py-8">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black tracking-[0.3em] uppercase border-[#0B7C6B]/20 text-[#0B7C6B]"
                  >
                    QUOTE OF THE MOMENT
                  </Badge>

                  <blockquote className="space-y-6">
                    <p className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 leading-relaxed tracking-tight italic px-4 md:px-12">
                      &ldquo;{quote.text}&rdquo;
                    </p>

                    <footer className="space-y-2">
                      <cite className="not-italic text-lg md:text-xl font-bold text-[#0B7C6B]">
                        — {quote.author}
                      </cite>
                      {quote.source && (
                        <p className="text-sm text-gray-500 font-medium">
                          {quote.source}
                        </p>
                      )}
                    </footer>
                  </blockquote>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() =>
                        queryClient.invalidateQueries({
                          queryKey: ['randomQuote'],
                        })
                      }
                      className="group text-xs uppercase tracking-[0.3em] font-black text-gray-400 hover:text-[#0B7C6B] transition-colors flex items-center gap-2 px-6 py-3 border border-gray-200 hover:border-[#0B7C6B]/20 rounded-full hover:bg-[#0B7C6B]/5"
                    >
                      <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                      New Quote
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="py-16 px-4 bg-[#E2504E]">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-14 gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg shadow-sm">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black tracking-widest uppercase border-white/30 text-white"
                >
                  ALL-TIME BEST
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight">
                Global Bestsellers
              </h2>
              <p className="text-white/80 text-lg">
                The world&apos;s most beloved literature, curated for you.
              </p>
              <Link href="/books/bestsellers" className="mt-2">
                <Button
                  variant="outline"
                  className="rounded-full border-white/30 text-white hover:border-white hover:bg-white hover:text-[#E2504E] transition-all group font-medium text-base h-12 px-8"
                >
                  View all bestsellers
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {bestsellersLoading ? (
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse max-w-[200px] mx-auto">
                    <div className="bg-white/20 aspect-3/4 rounded-xl mb-4" />
                    <div className="h-3 bg-white/20 rounded mb-2 mx-auto w-3/4" />
                    <div className="h-3 bg-white/20 rounded mx-auto w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                {bestsellers?.data.slice(0, 3).map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onMouseEnter={() => prefetchBook(book.id)}
                  >
                    <div className="group cursor-pointer max-w-[200px] mx-auto">
                      <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-50 aspect-3/4 shadow-xs group-hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <Image
                          src={
                            book.imageUrl ||
                            'https://covers.openlibrary.org/b/id/12583098-L.jpg'
                          }
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 33vw, 20vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 h-8 w-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-black border border-white shadow-lg overflow-hidden">
                          <div className="absolute inset-0 bg-yellow-400/10" />
                          <span className="relative z-10 text-xs">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-white/90 transition-colors leading-tight">
                          {book.title}
                        </h3>
                        <p className="text-sm text-white/70 font-medium">
                          {book.author}
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <span className="text-base font-bold text-white">
                            {formatPrice(Number(book.price))}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full border border-white/30">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[11px] font-black text-white tracking-tight">
                              4.8
                            </span>
                          </div>
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
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-4">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="text-[10px] font-black tracking-widest uppercase border-gray-200 text-gray-500"
                >
                  LITERARY MASTERS
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  Featured Authors
                </h2>
                <p className="text-gray-500 text-lg">
                  Celebrate the voices that define generations.
                </p>
              </div>
              <Link href="/authors">
                <Button
                  variant="outline"
                  className="rounded-full h-12 px-8 border-gray-200 hover:bg-black hover:text-white transition-all font-medium text-base group"
                >
                  EXPLORE ALL AUTHORS
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredAuthors.map(author => (
                <div
                  key={author.name}
                  className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-black/5 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${author.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`}
                  />

                  <div className="relative mb-6 w-36 h-36">
                    <div
                      className={`absolute -inset-4 bg-linear-to-br ${author.color} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                    />
                    <Image
                      src={author.image}
                      alt={author.name}
                      fill
                      sizes="144px"
                      className="object-cover rounded-full border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="space-y-4 z-10 w-full">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0B7C6B] transition-colors leading-tight">
                        {author.name}
                      </h3>
                      <p className="text-xs uppercase tracking-widest font-black text-gray-400">
                        {author.catalogCount > 0
                          ? `${author.catalogCount} title${author.catalogCount === 1 ? '' : 's'} in catalog`
                          : author.booksLabel}
                      </p>
                    </div>

                    <div
                      className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-linear-to-r ${author.color} text-white shadow-md`}
                    >
                      {author.genre}
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed italic">
                      {author.summary}
                    </p>

                    <Link
                      href={getAuthorHref(author.name)}
                      className="block pt-2"
                    >
                      <Button
                        variant="ghost"
                        className="w-full rounded-full h-11 border border-gray-100 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all group font-bold text-xs tracking-widest uppercase"
                      >
                        View collection
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-white">
          <div className="container mx-auto">
            <div className="relative rounded-[3rem] bg-black p-12 md:p-24 overflow-hidden shadow-2xl">
              {/* Abstract decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B7C6B] opacity-20 blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500 opacity-10 blur-[80px] -ml-32 -mb-32" />

              <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                <Badge
                  variant="outline"
                  className="text-[10px] font-black tracking-[0.4em] uppercase border-white/20 text-white/60 px-4 py-1.5 rounded-full"
                >
                  THE LUMORA NEWSLETTER
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  Stories, delivered <br />
                  <span className="text-white/40 italic">to your inbox.</span>
                </h2>
                <p className="text-lg md:text-xl text-white/60 font-light max-w-xl mx-auto">
                  Join 50,000+ book lovers and get the latest releases,
                  exclusive deals, and curated reading lists.
                </p>

                <form
                  className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-6"
                  onSubmit={e => e.preventDefault()}
                >
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 bg-white/10 border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium h-16 text-lg"
                  />
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-black hover:bg-gray-200 h-16 px-10 font-bold text-lg shadow-xl hover:scale-105 transition-all"
                  >
                    Subscribe
                  </Button>
                </form>

                <p className="text-xs text-white/30 pt-4 font-medium tracking-wide">
                  NO SPAM. JUST GREAT READS. UNSUBSCRIBE ANYTIME.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-900 pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-20">
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-[#0B7C6B]" />
                <span className="font-bold text-2xl tracking-tighter">
                  Lumora
                </span>
              </div>
              <p className="text-gray-500 leading-relaxed text-base font-light">
                Where stories come to light. We curate the finest collection of
                literature to inspire and enlighten your mind. Discover your
                next great adventure with us.
              </p>
              <div className="flex gap-4 pt-4">
                {/* Social icons placeholders */}
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    <div className="h-4 w-4 rounded-sm bg-current opacity-30" />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <div className="space-y-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">
                  Shop
                </h3>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                  <li>
                    <Link
                      href="/books"
                      className="hover:text-black transition-colors"
                    >
                      All Books
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/books/trending"
                      className="hover:text-black transition-colors"
                    >
                      Trending
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/books/bestsellers"
                      className="hover:text-black transition-colors"
                    >
                      Bestsellers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/books/new-arrivals"
                      className="hover:text-black transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">
                  Support
                </h3>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Shipping Info
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Returns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">
                  Company
                </h3>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-black transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400 font-medium uppercase tracking-widest">
            <p>&copy; 2026 Lumora. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
