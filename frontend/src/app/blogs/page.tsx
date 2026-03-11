'use client';

import { useBlogs } from '@/lib/hooks/use-blogs';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenTool, Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogsPage() {
  const { data: blogs, isLoading } = useBlogs();
  const { isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-12 px-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bookstore Blog</h1>
            <p className="text-gray-600">Discover insights, reviews, and stories from our community.</p>
          </div>
          {isAuthenticated && (
            <Link href="/blogs/create">
              <Button className="bg-[#0B7C6B] hover:bg-[#096B5B] text-white">
                <PenTool className="mr-2 h-4 w-4" />
                Write a Post
              </Button>
            </Link>
          )}
        </div>

        {(!blogs || blogs.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your thoughts with the community!</p>
            {isAuthenticated ? (
              <Link href="/blogs/create">
                <Button variant="outline" className="border-[#0B7C6B] text-[#0B7C6B] hover:bg-[#F4F8F8]">
                  Write a Post
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline">Sign in to post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  <div className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{blog.author.firstName} {blog.author.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 mt-auto">
                  <Link href={`/blogs/${blog.id}`} className="inline-flex items-center text-sm font-semibold text-[#0B7C6B] hover:text-[#096B5B]">
                    Read More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
