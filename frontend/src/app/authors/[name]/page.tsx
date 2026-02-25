'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BookCard } from '@/components/books/book-card';
import { Button } from '@/components/ui/button';
import { useBooks } from '@/lib/hooks/use-books';
import { ArrowLeft, BookOpen, Award, Calendar } from 'lucide-react';

// Famous authors data with real information
const AUTHORS_DATA: Record<
  string,
  {
    name: string;
    image: string;
    bio: string;
    birthYear: string;
    nationality: string;
    genres: string[];
    awards: string[];
    famousWorks: string[];
  }
> = {
  'Stephen King': {
    name: 'Stephen King',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Stephen Edwin King is an American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels. Described as the "King of Horror", his books have sold more than 350 million copies, and many have been adapted into films, television series, miniseries, and comic books.',
    birthYear: '1947',
    nationality: 'American',
    genres: ['Horror', 'Supernatural Fiction', 'Suspense', 'Fantasy'],
    awards: [
      'Bram Stoker Award',
      'World Fantasy Award',
      'British Fantasy Society Award',
    ],
    famousWorks: ['The Shining', 'It', 'The Stand', 'Carrie', 'Misery'],
  },
  'J.K. Rowling': {
    name: 'J.K. Rowling',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: "Joanne Rowling, better known by her pen name J.K. Rowling, is a British author and philanthropist. She wrote Harry Potter, a seven-volume children's fantasy series published from 1997 to 2007. The series has sold over 500 million copies, been translated into 80 languages, and spawned a global media franchise.",
    birthYear: '1965',
    nationality: 'British',
    genres: ['Fantasy', 'Drama', 'Young Adult', 'Crime Fiction'],
    awards: ['Hugo Award', 'British Book Awards', 'Locus Award'],
    famousWorks: [
      'Harry Potter Series',
      'The Casual Vacancy',
      'Cormoran Strike Series',
    ],
  },
  'Agatha Christie': {
    name: 'Agatha Christie',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections, particularly those revolving around fictional detectives Hercule Poirot and Miss Marple. She is the best-selling fiction writer of all time, with her novels having sold over two billion copies.',
    birthYear: '1890-1976',
    nationality: 'British',
    genres: ['Mystery', 'Crime Fiction', 'Detective Fiction', 'Thriller'],
    awards: ['Grand Master Award', 'Mystery Writers of America'],
    famousWorks: [
      'Murder on the Orient Express',
      'And Then There Were None',
      'The Murder of Roger Ackroyd',
    ],
  },
  'Ernest Hemingway': {
    name: 'Ernest Hemingway',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style—which he termed the "iceberg theory"—had a strong influence on 20th-century fiction. Many of his works are considered classics of American literature.',
    birthYear: '1899-1961',
    nationality: 'American',
    genres: ['Fiction', 'Non-fiction', 'Short Stories'],
    awards: ['Nobel Prize in Literature', 'Pulitzer Prize'],
    famousWorks: [
      'The Old Man and the Sea',
      'A Farewell to Arms',
      'For Whom the Bell Tolls',
    ],
  },
  'George Orwell': {
    name: 'George Orwell',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/440px-George_Orwell_press_photo.jpg',
    bio: 'Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is characterized by lucid prose, social criticism, opposition to totalitarianism, and support of democratic socialism.',
    birthYear: '1903-1950',
    nationality: 'British',
    genres: ['Political Fiction', 'Dystopian', 'Social Criticism'],
    awards: ['Prometheus Hall of Fame Award'],
    famousWorks: ['1984', 'Animal Farm', 'Homage to Catalonia'],
  },
  'Jane Austen': {
    name: 'Jane Austen',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/CassandraAusten-JaneAusten%28c.1810%29_hires.jpg/440px-CassandraAusten-JaneAusten%28c.1810%29_hires.jpg',
    bio: 'Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century. Her plots often explore the dependence of women on marriage in the pursuit of favorable social standing and economic security.',
    birthYear: '1775-1817',
    nationality: 'British',
    genres: ['Romance', 'Social Commentary', 'Satire'],
    awards: ['Inducted into the Hall of Fame for Great Women Writers'],
    famousWorks: [
      'Pride and Prejudice',
      'Sense and Sensibility',
      'Emma',
      'Persuasion',
    ],
  },
  'Ernest Hemingway': {
    name: 'Ernest Hemingway',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/ErnestHemingway.jpg/440px-ErnestHemingway.jpg',
    bio: 'Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style—which he termed the "iceberg theory"—had a strong influence on 20th-century fiction. Many of his works are considered classics of American literature.',
    birthYear: '1899-1961',
    nationality: 'American',
    genres: ['Fiction', 'Non-fiction', 'Short Stories'],
    awards: ['Nobel Prize in Literature', 'Pulitzer Prize'],
    famousWorks: [
      'The Old Man and the Sea',
      'A Farewell to Arms',
      'For Whom the Bell Tolls',
    ],
  },
  'Agatha Christie': {
    name: 'Agatha Christie',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Agatha_Christie.png/440px-Agatha_Christie.png',
    bio: 'Dame Agatha Mary Clarissa Christie was an English writer known for her 66 detective novels and 14 short story collections, particularly those revolving around fictional detectives Hercule Poirot and Miss Marple. She is the best-selling fiction writer of all time, with her novels having sold over two billion copies.',
    birthYear: '1890-1976',
    nationality: 'British',
    genres: ['Mystery', 'Crime Fiction', 'Detective Fiction', 'Thriller'],
    awards: ['Grand Master Award', 'Mystery Writers of America'],
    famousWorks: [
      'Murder on the Orient Express',
      'And Then There Were None',
      'The Murder of Roger Ackroyd',
    ],
  },
};

export default function AuthorPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = use(params);
  const authorName = decodeURIComponent(resolvedParams.name);
  const authorData = AUTHORS_DATA[authorName];

  const [page, setPage] = useState(1);
  const { data: booksData, isLoading } = useBooks({
    author: authorName,
    page,
    limit: 12,
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!authorData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto py-20 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t find information about this author.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Author Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Author Image */}
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-12 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg blur-2xl opacity-20" />
                <div className="relative bg-white p-2 rounded-lg shadow-2xl border-4 border-yellow-400">
                  <img
                    src={authorData.image}
                    alt={authorData.name}
                    className="w-80 h-96 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Author Info */}
            <div className="p-12">
              <div className="mb-6">
                <span className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
                  About Author
                </span>
                <h1 className="text-4xl font-bold mt-2 mb-4">
                  {authorData.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{authorData.birthYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🌍</span>
                    <span>{authorData.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 leading-relaxed mb-8">
                {authorData.bio}
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {booksData?.meta.total || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Books Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    4.5
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {authorData.famousWorks.length}
                  </div>
                  <div className="text-sm text-gray-600">Famous Works</div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      Explore {authorData.name.split(' ')[0]}&apos;s Collection
                    </h3>
                    <p className="text-indigo-100 text-sm mb-4">
                      Discover all available books by this renowned author in
                      our collection.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4" />
                      <span>{authorData.awards[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Genres */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Literary Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {authorData.genres.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Awards & Honors
            </h3>
            <ul className="space-y-2">
              {authorData.awards.map(award => (
                <li
                  key={award}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{award}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Famous Works */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Notable Works
            </h3>
            <ul className="space-y-2">
              {authorData.famousWorks.slice(0, 5).map(work => (
                <li
                  key={work}
                  className="text-sm text-gray-700 flex items-start gap-2"
                >
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>{work}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Books by Author */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">
            Books by {authorData.name}
            {booksData && (
              <span className="text-gray-500 text-xl ml-3">
                ({booksData.meta.total})
              </span>
            )}
          </h2>

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
          ) : booksData && booksData.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {booksData.data.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {booksData.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!booksData.meta.hasPreviousPage}
                  >
                    Previous
                  </Button>

                  <span className="px-4 text-gray-600">
                    Page {booksData.meta.page} of {booksData.meta.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!booksData.meta.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">
                No books found by this author in our collection.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check back later for new additions!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
