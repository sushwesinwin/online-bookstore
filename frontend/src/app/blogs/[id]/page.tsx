'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useBlog, useBlogs } from '@/lib/hooks/use-blogs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock3,
  MessageCircle,
  Share2,
} from 'lucide-react';
import {
  getAuthorHandle,
  getAuthorInitials,
  getBlogFontClass,
  getBlogVisibilityLabel,
  getEstimatedReadTime,
  getPlainTextExcerpt,
  getRelativeBlogTime,
} from '@/lib/blog-posts';
import { cn } from '@/lib/utils';

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: blog, isLoading } = useBlog(id);
  const { data: allBlogs } = useBlogs();

  const relatedBlogs = useMemo(
    () => (allBlogs ?? []).filter(item => item.id !== id).slice(0, 3),
    [allBlogs, id]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0B7C6B]" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] px-6 py-24 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
          Missing Post
        </p>
        <h1 className="mt-4 text-3xl font-black text-[#101313]">
          That post is no longer in the feed.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#66726F]">
          It may have been removed or the link is no longer valid.
        </p>
        <Link href="/blogs" className="mt-8 inline-flex">
          <Button className="rounded-full bg-[#101313] px-6 hover:bg-[#1C2322]">
            Return to feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F4F8F7_0%,#EEF4F2_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-5">
            <div className="flex items-center justify-between gap-4 rounded-[28px] border border-[#DDE7E4] bg-white px-5 py-4 shadow-sm md:px-6">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#66726F] transition-colors hover:text-[#0B7C6B]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to feed
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                <span className="rounded-full bg-[#F6FAF8] px-3 py-2 text-xs font-semibold text-[#66726F]">
                  {getRelativeBlogTime(blog.createdAt)}
                </span>
                <span className="rounded-full bg-[#F6FAF8] px-3 py-2 text-xs font-semibold text-[#66726F]">
                  {getEstimatedReadTime(blog.content)}
                </span>
              </div>
            </div>

            <article className="overflow-hidden rounded-[32px] border border-[#DDE7E4] bg-white shadow-sm">
              <div className="px-5 py-6 md:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#0B7C6B,#17BD8D)] text-base font-black text-white shadow-[0_14px_30px_rgba(11,124,107,0.24)]">
                    {getAuthorInitials(blog.author.firstName, blog.author.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#101313]">
                        {blog.author.firstName} {blog.author.lastName}
                      </span>
                      <span className="text-sm text-[#8B9794]">
                        {getAuthorHandle(blog.author.firstName, blog.author.lastName)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#66726F]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF7F4] px-3 py-1 text-[#0B7C6B]">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Reader post
                      </span>
                      {blog.visibility !== 'PUBLIC' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E8] px-3 py-1 text-[#A36005]">
                          {getBlogVisibilityLabel(blog.visibility)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F6FAF8] px-3 py-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {getEstimatedReadTime(blog.content)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F6FAF8] px-3 py-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h1 className="text-3xl font-black tracking-tight text-[#101313] md:text-5xl">
                    {blog.title}
                  </h1>
                  <p
                    className={cn(
                      'mt-4 text-base leading-8 text-[#4B5754] md:text-lg',
                      getBlogFontClass(blog.fontFamily)
                    )}
                  >
                    {getPlainTextExcerpt(blog.content, 220)}
                  </p>
                </div>
              </div>

              {blog.featureImage && (
                <div className="border-y border-[#EDF2F0] bg-[#F6FAF8]">
                  <img
                    src={blog.featureImage}
                    alt={blog.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              )}

              <div className="px-5 py-6 md:px-8">
                <div
                  className={cn(
                    'prose prose-lg max-w-none prose-headings:text-[#101313] prose-p:leading-8 prose-a:text-[#0B7C6B] hover:prose-a:text-[#096B5B]',
                    getBlogFontClass(blog.fontFamily)
                  )}
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF2F0] px-5 py-4 md:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#F6FAF8] px-4 py-2 text-sm font-semibold text-[#66726F]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#0B7C6B]" />
                    Conversation open
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#F6FAF8] px-4 py-2 text-sm font-semibold text-[#66726F]"
                  >
                    <Bookmark className="h-4 w-4 text-[#101313]" />
                    Save post
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#101313] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </article>
          </main>

          <aside className="space-y-5">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
                  Author Card
                </p>
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#101313] text-base font-black text-white">
                    {getAuthorInitials(blog.author.firstName, blog.author.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#101313]">
                      {blog.author.firstName} {blog.author.lastName}
                    </p>
                    <p className="text-sm text-[#66726F]">
                      {getAuthorHandle(blog.author.firstName, blog.author.lastName)}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#66726F]">
                      Posted {getRelativeBlogTime(blog.createdAt)} with a{' '}
                      {blog.fontFamily === 'classic-mono'
                        ? 'technical'
                        : blog.fontFamily === 'editorial-serif'
                          ? 'magazine'
                          : blog.fontFamily === 'literary-serif'
                            ? 'bookish'
                            : 'clean'}{' '}
                      reading tone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#101313]">
                  Continue Reading
                </p>
                <div className="mt-4 space-y-4">
                  {relatedBlogs.length > 0 ? (
                    relatedBlogs.map(item => (
                      <Link
                        key={item.id}
                        href={`/blogs/${item.id}`}
                        className="block rounded-2xl bg-[#F8FBFA] p-4 transition-colors hover:bg-[#F1F8F5]"
                      >
                        <p className="text-sm font-bold text-[#101313]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[#66726F]">
                          {getPlainTextExcerpt(item.content, 96)}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[#66726F]">
                      More posts will appear here as the community grows.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
