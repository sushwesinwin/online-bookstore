'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AUTHOR_PROFILES, getAuthorHref } from '@/lib/authors';

export default function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = useMemo(
    () => [
      'All',
      ...Array.from(new Set(AUTHOR_PROFILES.map(author => author.genre))),
    ],
    []
  );

  const filteredAuthors = useMemo(
    () =>
      AUTHOR_PROFILES.filter(author => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          author.name.toLowerCase().includes(query) ||
          author.summary.toLowerCase().includes(query);
        const matchesGenre =
          selectedGenre === 'All' || author.genre === selectedGenre;
        return matchesSearch && matchesGenre;
      }),
    [searchQuery, selectedGenre]
  );

  return (
    <div className="min-h-screen bg-[#F9FCFB]">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-[#0B7C6B] to-[#17BD8D] py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0 backdrop-blur-sm"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Discover Great Authors
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Featured Authors
              </h1>

              <p className="text-lg text-white/90">
                Explore works from the world&apos;s most celebrated writers
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 px-4 bg-white border-b border-[#E4E9E8]">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E4E9E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B7C6B]"
                />
              </div>

              {/* Genre Filter */}
              <div className="flex gap-2 flex-wrap justify-center">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedGenre === genre
                        ? 'bg-[#0B7C6B] text-white'
                        : 'bg-[#F4F8F8] text-[#848785] hover:bg-[#E4E9E8]'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-[#848785]">
              Showing {filteredAuthors.length} of {AUTHOR_PROFILES.length}{' '}
              authors
            </div>
          </div>
        </section>

        {/* Authors Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {filteredAuthors.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-[#848785] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#101313] mb-2">
                  No authors found
                </h3>
                <p className="text-[#848785]">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAuthors.map(author => (
                  <div
                    key={author.name}
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

                      <div className="flex items-center justify-center gap-2 text-xs text-[#848785]">
                        <span>{author.nationality}</span>
                        <span>•</span>
                        <span>{author.lifeSpan}</span>
                      </div>

                      <p className="text-sm text-[#848785]">
                        {author.booksLabel}
                      </p>

                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r ${author.color} text-white`}
                      >
                        {author.genre}
                      </div>

                      <p className="text-sm text-[#848785] pt-2">
                        {author.summary}
                      </p>

                      {/* Famous Works */}
                      <div className="pt-3 border-t border-[#E4E9E8] mt-3">
                        <p className="text-xs font-semibold text-[#101313] mb-2">
                          Famous Works:
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {author.famousWorks.slice(0, 2).map(work => (
                            <span
                              key={work}
                              className="text-xs bg-[#F4F8F8] text-[#848785] px-2 py-1 rounded"
                            >
                              {work}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link href={getAuthorHref(author.name)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                      >
                        View Books
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-linear-to-br from-[#0B7C6B] to-[#17BD8D]">
          <div className="container mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Can&apos;t Find Your Favorite Author?
              </h2>
              <p className="text-lg text-white/90">
                We&apos;re constantly adding new authors and books to our
                collection
              </p>
              <Link href="/books">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-[#0B7C6B] hover:bg-white/90"
                >
                  Browse All Books
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#101313] text-[#848785] py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-[#0B7C6B]" />
                <span className="font-bold text-white text-xl">Lumora</span>
              </div>
              <p className="text-sm">
                Your trusted source for books. Discover, read, and grow with us.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Shop</h3>
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
                    href="/authors"
                    className="hover:text-[#0B7C6B] transition-colors"
                  >
                    Authors
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
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
              <h3 className="font-semibold text-white mb-4">Company</h3>
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
              &copy; 2024 Lumora. All rights reserved. Made with ❤️ for book
              lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
