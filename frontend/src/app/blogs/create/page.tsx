'use client';

import { cn } from '@/lib/utils';
import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  ImagePlus,
  PenSquare,
  Send,
  Sparkles,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateBlog } from '@/lib/hooks/use-blogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import {
  BLOG_FONT_OPTIONS,
  BLOG_VISIBILITY_OPTIONS,
  DEFAULT_BLOG_FONT_FAMILY,
  DEFAULT_BLOG_POST_VISIBILITY,
  getBlogFontClass,
  getEstimatedReadTime,
  getBlogVisibilityLabel,
  getPlainTextExcerpt,
  type BlogFontFamily,
  type BlogPostVisibility,
} from '@/lib/blog-posts';

export default function CreateBlogPage() {
  const router = useRouter();
  const { mutate: createBlog, isPending } = useCreateBlog();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [featureImage, setFeatureImage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<BlogPostVisibility>(
    DEFAULT_BLOG_POST_VISIBILITY
  );
  const [fontFamily, setFontFamily] = useState<BlogFontFamily>(
    DEFAULT_BLOG_FONT_FAMILY
  );

  const previewFontClassName = useMemo(
    () => getBlogFontClass(fontFamily),
    [fontFamily]
  );

  const featureImageAlt = title.trim() || 'Feature image preview';
  const previewExcerpt =
    getPlainTextExcerpt(content, 220) ||
    'Write a quick reader reaction, a deeper review, or a shelf note. The feed preview updates as you shape the post.';

  const getCreateErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return 'Failed to create post. Please try again.';
  };

  const handleFeatureImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFeatureImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }

    setSubmitError(null);

    createBlog(
      {
        title,
        content,
        featureImage: featureImage.trim() || null,
        fontFamily,
        visibility,
      },
      {
        onSuccess: () => {
          router.push('/blogs');
          router.refresh();
        },
        onError: error => {
          const message = getCreateErrorMessage(error);
          setSubmitError(message);
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F4F8F7_0%,#EEF4F2_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#66726F] transition-colors hover:text-[#0B7C6B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="overflow-hidden rounded-[32px] border border-[#DDE7E4] bg-white shadow-sm">
            <div className="border-b border-[#EDF2F0] px-6 py-6 md:px-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E9F7F3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
                <Sparkles className="h-3.5 w-3.5" />
                Social Composer
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[#101313] md:text-4xl">
                Create a post for the reader feed.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#66726F] md:text-base">
                This page is tuned for short-form social sharing first. Add a
                striking title, optional image, and a reading font that fits the
                mood before you publish.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 px-6 py-6 md:px-8">
              {submitError && (
                <div className="flex items-start gap-2 rounded-2xl border border-[#FF4E3E]/20 bg-[#FFECEB] p-4 text-sm text-[#B42318]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <section className="rounded-[28px] border border-[#E6ECEA] bg-[#FBFDFC] p-5">
                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-[#101313]"
                >
                  Feed headline
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value);
                    if (submitError) {
                      setSubmitError(null);
                    }
                  }}
                  placeholder="What should stop the scroll?"
                  className="mt-3 h-14 rounded-2xl text-lg"
                  required
                />
                <p className="mt-3 text-sm text-[#66726F]">
                  Keep it punchy. Think social headline, not chapter title.
                </p>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[28px] border border-[#E6ECEA] bg-[#FBFDFC] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#101313]">
                    <ImagePlus className="h-4 w-4 text-[#0B7C6B]" />
                    Attach visual
                  </div>
                  <Input
                    value={featureImage}
                    onChange={event => {
                      setFeatureImage(event.target.value);
                      if (submitError) {
                        setSubmitError(null);
                      }
                    }}
                    placeholder="Paste an image URL"
                    className="mt-4 rounded-2xl"
                  />
                  <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#BFD4CE] bg-white px-4 py-4 text-sm font-semibold text-[#0B7C6B] transition-colors hover:border-[#0B7C6B] hover:bg-[#F3FBF8]">
                    <Upload className="h-4 w-4" />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={event => {
                        if (submitError) {
                          setSubmitError(null);
                        }
                        handleFeatureImageUpload(event);
                      }}
                    />
                  </label>
                  {featureImage && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#E6ECEA] bg-white">
                      <img
                        src={featureImage}
                        alt={featureImageAlt}
                        className="h-48 w-full object-cover"
                      />
                      <div className="flex items-center justify-between px-4 py-3">
                        <p className="text-xs font-semibold text-[#66726F]">
                          Image ready for the feed
                        </p>
                        <button
                          type="button"
                          onClick={() => setFeatureImage('')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#C2410C] hover:text-[#9A3412]"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-[#E6ECEA] bg-[#FBFDFC] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#101313]">
                    <Type className="h-4 w-4 text-[#0B7C6B]" />
                    Reading style
                  </div>
                  <div className="mt-4 grid gap-3">
                    {BLOG_FONT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFontFamily(option.value as BlogFontFamily)
                        }
                        className={cn(
                          'rounded-2xl border px-4 py-4 text-left transition-all',
                          fontFamily === option.value
                            ? 'border-[#0B7C6B] bg-[#F0FBF7] shadow-sm'
                            : 'border-[#E6ECEA] bg-white hover:border-[#BFD4CE]'
                        )}
                      >
                        <div
                          className={cn(
                            'text-base font-semibold text-[#101313]',
                            option.className
                          )}
                        >
                          {option.label}
                        </div>
                        <p className="mt-1 text-xs text-[#66726F]">
                          {option.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#E6ECEA] bg-[#FBFDFC] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#101313]">
                  <Sparkles className="h-4 w-4 text-[#0B7C6B]" />
                  Audience permission
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {BLOG_VISIBILITY_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVisibility(option.value)}
                      className={cn(
                        'rounded-2xl border px-4 py-4 text-left transition-all',
                        visibility === option.value
                          ? 'border-[#0B7C6B] bg-[#F0FBF7] shadow-sm'
                          : 'border-[#E6ECEA] bg-white hover:border-[#BFD4CE]'
                      )}
                    >
                      <div className="text-base font-semibold text-[#101313]">
                        {option.label}
                      </div>
                      <p className="mt-1 text-xs text-[#66726F]">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#66726F]">
                  Set exactly who can read the post before you publish it.
                </p>
              </section>

              <section className="rounded-[28px] border border-[#E6ECEA] bg-white p-4 md:p-5">
                <div className="flex items-center gap-2 pb-4 text-sm font-semibold text-[#101313]">
                  <PenSquare className="h-4 w-4 text-[#0B7C6B]" />
                  Post body
                </div>
                <div
                  className={cn(
                    'overflow-hidden rounded-[24px] border border-[#D9E5E1] bg-white',
                    previewFontClassName
                  )}
                >
                  <WysiwygEditor
                    value={content}
                    onChange={value => {
                      setContent(value);
                      if (submitError) {
                        setSubmitError(null);
                      }
                    }}
                    placeholder="Write what you would post in the feed. Reviews, reactions, shelf thoughts, and recommendations all work here."
                  />
                </div>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#E6ECEA] bg-[#FBFDFC] px-5 py-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#66726F]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                    <Clock3 className="h-4 w-4 text-[#0B7C6B]" />
                    {getEstimatedReadTime(content)}
                  </span>
                  <span className="rounded-full bg-white px-3 py-2">
                    {BLOG_FONT_OPTIONS.find(option => option.value === fontFamily)?.label}
                  </span>
                  <span className="rounded-full bg-white px-3 py-2">
                    {getBlogVisibilityLabel(visibility)}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !title.trim() || !content.trim()}
                  className="h-12 rounded-full bg-[#101313] px-6 hover:bg-[#1C2322]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isPending ? 'Publishing...' : 'Publish to feed'}
                </Button>
              </div>
            </form>
          </div>

          <aside className="space-y-5">
            <div className="sticky top-24 space-y-5">
              <div className="overflow-hidden rounded-[32px] border border-[#DDE7E4] bg-white shadow-sm">
                <div className="border-b border-[#EDF2F0] px-6 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
                    Feed Preview
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[#101313]">
                    How the post appears
                  </h2>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101313] text-sm font-black text-white">
                      LU
                    </div>
                    <div>
                      <p className="font-bold text-[#101313]">Lumora Reader</p>
                      <p className="text-sm text-[#66726F]">@lumorareader</p>
                    </div>
                  </div>

                  <div className="mt-4 inline-flex rounded-full bg-[#EEF7F4] px-3 py-1 text-xs font-semibold text-[#0B7C6B]">
                    {getBlogVisibilityLabel(visibility)}
                  </div>

                  <h3 className="mt-5 text-2xl font-black tracking-tight text-[#101313]">
                    {title.trim() || 'Your post headline will appear here'}
                  </h3>

                  <p
                    className={cn(
                      'mt-4 text-[15px] leading-8 text-[#33403D]',
                      previewFontClassName
                    )}
                  >
                    {previewExcerpt}
                  </p>
                </div>

                {featureImage ? (
                  <img
                    src={featureImage}
                    alt={featureImageAlt}
                    className="h-56 w-full border-y border-[#EDF2F0] object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center border-y border-[#EDF2F0] bg-[radial-gradient(circle_at_top_left,#D7F7EC,transparent_45%),linear-gradient(135deg,#F7FBFA,#EEF5F2)] px-8 text-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0B7C6B]">
                        Optional Image
                      </p>
                      <p className="mt-3 text-sm text-[#66726F]">
                        A feature image gives the post stronger presence in the
                        main feed.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-6 py-4 text-sm text-[#66726F]">
                  <span>{getEstimatedReadTime(content)}</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#101313]">
                  Posting Notes
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#66726F]">
                  <li>Lead with the strongest thought in the first sentence.</li>
                  <li>Use an image when the post depends on visual atmosphere.</li>
                  <li>Shorter feed copy usually performs better than heavy intros.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
