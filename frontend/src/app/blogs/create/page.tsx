'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBlog } from '@/lib/hooks/use-blogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPage() {
  const router = useRouter();
  const { mutate: createBlog, isPending } = useCreateBlog();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createBlog(
      { title, content },
      {
        onSuccess: () => {
          router.push('/blogs');
          router.refresh();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#0B7C6B] mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create a New Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Post Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter an engaging title..."
                className="text-lg py-6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Content
              </label>
              <div className="border rounded-md min-h-[400px]">
                <WysiwygEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your thoughts here..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isPending || !title.trim() || !content.trim()}
                className="bg-[#0B7C6B] hover:bg-[#096B5B] text-white px-8 py-6 text-lg"
              >
                {isPending ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
