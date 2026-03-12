'use client';

import { useParams } from 'next/navigation';
import { useBlog } from '@/lib/hooks/use-blogs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: blog, isLoading } = useBlog(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Post Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          This blog post could not be found or has been removed.
        </p>
        <Link href="/blogs">
          <Button className="bg-[#0B7C6B] hover:bg-[#096B5B]">
            Return to Blogs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#0B7C6B] mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#0B7C6B]" />
                <span className="font-medium text-gray-700">
                  {blog.author.firstName} {blog.author.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#0B7C6B]" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </header>

          <div className="h-px bg-gray-100 w-full max-w-xl mx-auto mb-10" />

          <div
            className="prose prose-lg prose-indigo max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-a:text-[#0B7C6B] hover:prose-a:text-[#096B5B]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </div>
  );
}
