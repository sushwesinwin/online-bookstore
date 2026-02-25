'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { useState } from 'react';

const authors = [
  {
    name: 'George Orwell',
    books: '20+ Books',
    genre: 'Political Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/440px-George_Orwell_press_photo.jpg',
    bio: 'Author of 1984 and Animal Farm',
    color: 'from-[#0B7C6B] to-[#17BD8D]',
    nationality: 'British',
    born: '1903',
    famousWorks: ['1984', 'Animal Farm', 'Homage to Catalonia'],
  },
  {
    name: 'Jane Austen',
    books: '6 Major Novels',
    genre: 'Romance',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg/440px-CassandraAusten-JaneAusten%28c.1810%29_hires.jpg',
    bio: 'Author of Pride and Prejudice',
    color: 'from-[#FF6320] to-[#FFA118]',
    nationality: 'British',
    born: '1775',
    famousWorks: ['Pride and Prejudice', 'Sense and Sensibility', 'Emma'],
  },
  {
    name: 'Ernest Hemingway',
    books: '20+ Books',
    genre: 'Classic Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/ErnestHemingway.jpg/440px-ErnestHemingway.jpg',
    bio: 'Nobel Prize winning author',
    color: 'from-[#219FFF] to-[#17BD8D]',
    nationality: 'American',
    born: '1899',
    famousWorks: [
      'The Old Man and the Sea',
      'A Farewell to Arms',
      'For Whom the Bell Tolls',
    ],
  },
  {
    name: 'Agatha Christie',
    books: '80+ Books',
    genre: 'Mystery',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Agatha_Christie_%281925%29.jpg/440px-Agatha_Christie_%281925%29.jpg',
    bio: 'Queen of mystery novels',
    color: 'from-[#FF4E3E] to-[#FF6320]',
    nationality: 'British',
    born: '1890',
    famousWorks: [
      'Murder on the Orient Express',
      'And Then There Were None',
      'The Murder of Roger Ackroyd',
    ],
  },
  {
    name: 'F. Scott Fitzgerald',
    books: '5 Novels',
    genre: 'Classic Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/F_Scott_Fitzgerald_1921.jpg/440px-F_Scott_Fitzgerald_1921.jpg',
    bio: 'Author of The Great Gatsby',
    color: 'from-[#0B7C6B] to-[#219FFF]',
    nationality: 'American',
    born: '1896',
    famousWorks: [
      'The Great Gatsby',
      'Tender Is the Night',
      'This Side of Paradise',
    ],
  },
  {
    name: 'Virginia Woolf',
    books: '9 Novels',
    genre: 'Modernist Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg/440px-George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg',
    bio: 'Pioneer of modernist literature',
    color: 'from-[#17BD8D] to-[#FFA118]',
    nationality: 'British',
    born: '1882',
    famousWorks: ['Mrs Dalloway', 'To the Lighthouse', 'Orlando'],
  },
  {
    name: 'Mark Twain',
    books: '28 Books',
    genre: 'Satire & Humor',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mark_Twain_by_AF_Bradley.jpg/440px-Mark_Twain_by_AF_Bradley.jpg',
    bio: 'Father of American literature',
    color: 'from-[#FFA118] to-[#FF6320]',
    nationality: 'American',
    born: '1835',
    famousWorks: [
      'The Adventures of Tom Sawyer',
      'Adventures of Huckleberry Finn',
      'The Prince and the Pauper',
    ],
  },
  {
    name: 'Leo Tolstoy',
    books: '12 Novels',
    genre: 'Realist Fiction',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/440px-L.N.Tolstoy_Prokudin-Gorsky.jpg',
    bio: 'Master of realistic fiction',
    color: 'from-[#219FFF] to-[#0B7C6B]',
    nationality: 'Russian',
    born: '1828',
    famousWorks: ['War and Peace', 'Anna Karenina', 'The Death of Ivan Ilyich'],
  },
  {
    name: 'Charles Dickens',
    books: '15 Novels',
    genre: 'Victorian Literature',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Dickens_Gurney_head.jpg/440px-Dickens_Gurney_head.jpg',
    bio: 'Greatest novelist of Victorian era',
    color: 'from-[#FF4E3E] to-[#FFA118]',
    nationality: 'British',
    born: '1812',
    famousWorks: ['Great Expectations', 'A Tale of Two Cities', 'Oliver Twist'],
  },
  {
    name: 'J.K. Rowling',
    books: '14 Books',
    genre: 'Fantasy',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/440px-J._K._Rowling_2010.jpg',
    bio: 'Creator of Harry Potter series',
    color: 'from-[#0B7C6B] to-[#FF6320]',
    nationality: 'British',
    born: '1965',
    famousWorks: [
      'Harry Potter series',
      'The Casual Vacancy',
      'Cormoran Strike series',
    ],
  },
  {
    name: 'Stephen King',
    books: '60+ Books',
    genre: 'Horror & Suspense',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Stephen_King%2C_Comicon.jpg/440px-Stephen_King%2C_Comicon.jpg',
    bio: 'Master of horror fiction',
    color: 'from-[#FF4E3E] to-[#219FFF]',
    nationality: 'American',
    born: '1947',
    famousWorks: ['The Shining', 'It', 'The Stand'],
  },
  {
    name: 'Gabriel García Márquez',
    books: '18 Books',
    genre: 'Magical Realism',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Gabriel_Garcia_Marquez.jpg/440px-Gabriel_Garcia_Marquez.jpg',
    bio: 'Nobel Prize winning author',
    color: 'from-[#17BD8D] to-[#219FFF]',
    nationality: 'Colombian',
    born: '1927',
    famousWorks: [
      'One Hundred Years of Solitude',
      'Love in the Time of Cholera',
      'Chronicle of a Death Foretold',
    ],
  },
];

export default function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', ...Array.from(new Set(authors.map(a => a.genre)))];

  const filteredAuthors = authors.filter(author => {
    const matchesSearch =
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === 'All' || author.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-[#F9FCFB]">
      <Header />

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
              Showing {filteredAuthors.length} of {authors.length} authors
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
                {filteredAuthors.map((author, index) => (
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

                      <div className="flex items-center justify-center gap-2 text-xs text-[#848785]">
                        <span>{author.nationality}</span>
                        <span>•</span>
                        <span>Born {author.born}</span>
                      </div>

                      <p className="text-sm text-[#848785]">{author.books}</p>

                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-linear-to-r ${author.color} text-white`}
                      >
                        {author.genre}
                      </div>

                      <p className="text-sm text-[#848785] pt-2">
                        {author.bio}
                      </p>

                      {/* Famous Works */}
                      <div className="pt-3 border-t border-[#E4E9E8] mt-3">
                        <p className="text-xs font-semibold text-[#101313] mb-2">
                          Famous Works:
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {author.famousWorks.slice(0, 2).map((work, i) => (
                            <span
                              key={i}
                              className="text-xs bg-[#F4F8F8] text-[#848785] px-2 py-1 rounded"
                            >
                              {work}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link href={`/authors/${encodeURIComponent(author.name)}`}>
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
                <span className="font-bold text-white text-xl">Bookstore</span>
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
              &copy; 2024 Bookstore. All rights reserved. Made with ❤️ for book
              lovers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
