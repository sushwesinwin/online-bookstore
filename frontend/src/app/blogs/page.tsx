'use client';

import { useMemo } from 'react';
import { useBlogs } from '@/lib/hooks/use-blogs';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  useAddFriend,
  useFollowWriter,
  useRelationshipStatuses,
  useRemoveFriend,
  useUnfollowWriter,
} from '@/lib/hooks/use-social';
import { SocialRelationshipStatus } from '@/lib/api/social';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  Clock3,
  Flame,
  ImageIcon,
  MessageCircle,
  PenSquare,
  Sparkles,
  UserRound,
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

const FEED_TOPICS = [
  '#ReadingNotes',
  '#ShelfTalk',
  '#NewArrival',
  '#WeekendRead',
];

function WriterActions({
  status,
  isAuthenticated,
  onFollow,
  onUnfollow,
  onAddFriend,
  onRemoveFriend,
  isFollowPending,
  isFriendPending,
}: {
  status?: SocialRelationshipStatus;
  isAuthenticated: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  onAddFriend: () => void;
  onRemoveFriend: () => void;
  isFollowPending: boolean;
  isFriendPending: boolean;
}) {
  if (!isAuthenticated || !status || status.isSelf) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={status.isFollowing ? onUnfollow : onFollow}
        disabled={isFollowPending}
        className={cn(
          'rounded-full px-3 py-2 text-xs font-semibold transition-colors',
          status.isFollowing
            ? 'bg-[#101313] text-white hover:bg-[#1C2322]'
            : 'bg-[#EEF7F4] text-[#0B7C6B] hover:bg-[#E2F3ED]',
          isFollowPending && 'cursor-not-allowed opacity-70'
        )}
      >
        {isFollowPending
          ? 'Updating...'
          : status.isFollowing
            ? 'Unfollow'
            : 'Follow'}
      </button>
      <button
        type="button"
        onClick={status.isFriend ? onRemoveFriend : onAddFriend}
        disabled={isFriendPending}
        className={cn(
          'rounded-full px-3 py-2 text-xs font-semibold transition-colors',
          status.isFriend
            ? 'bg-[#FFF5E8] text-[#A36005] hover:bg-[#FDECD3]'
            : 'bg-[#F5F7F6] text-[#101313] hover:bg-[#EBEFED]',
          isFriendPending && 'cursor-not-allowed opacity-70'
        )}
      >
        {isFriendPending
          ? 'Updating...'
          : status.isFriend
            ? 'Unfriend'
            : 'Add Friend'}
      </button>
    </div>
  );
}

export default function BlogsPage() {
  const { data: blogs, isLoading } = useBlogs();
  const { isAuthenticated, user } = useAuth();

  const authors = useMemo(() => {
    const entries = blogs?.map(blog => blog.author) ?? [];
    return Array.from(
      new Map(entries.map(author => [author.id, author])).values()
    );
  }, [blogs]);

  const relationshipTargetIds = useMemo(
    () =>
      authors
        .map(author => author.id)
        .filter(authorId => authorId && authorId !== user?.id),
    [authors, user?.id]
  );

  const { data: relationshipStatuses } = useRelationshipStatuses(
    relationshipTargetIds,
    isAuthenticated
  );

  const followWriter = useFollowWriter(relationshipTargetIds);
  const unfollowWriter = useUnfollowWriter(relationshipTargetIds);
  const addFriend = useAddFriend(relationshipTargetIds);
  const removeFriend = useRemoveFriend(relationshipTargetIds);

  const relationshipMap = useMemo(
    () =>
      new Map(
        (relationshipStatuses ?? []).map(status => [status.userId, status])
      ),
    [relationshipStatuses]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0B7C6B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F4F8F7_0%,#EEF4F2_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[#101917] px-6 py-8 text-white shadow-[0_30px_100px_rgba(16,25,23,0.18)] md:px-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(23,189,141,0.32),transparent_45%),radial-gradient(circle_at_center_right,rgba(249,185,89,0.18),transparent_40%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#8CE5CA]">
                <Sparkles className="h-3.5 w-3.5" />
                Community Feed
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
                Browse blog posts like a live reading social.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 md:text-base">
                Follow what the Lumora community is reading, reviewing, and
                recommending. Fresh posts surface first, with fast previews and
                image-led storytelling.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {FEED_TOPICS.map(topic => (
                <span
                  key={topic}
                  className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white/80"
                >
                  {topic}
                </span>
              ))}
              {isAuthenticated ? (
                <Link href="/blogs/create">
                  <Button className="h-12 rounded-full bg-[#17BD8D] px-6 font-semibold text-[#08241D] hover:bg-[#26C99A]">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Create post
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-white/15 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                  >
                    Sign in to post
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
                  Feed Pulse
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-3xl font-black text-[#101313]">
                      {blogs?.length ?? 0}
                    </p>
                    <p className="text-sm text-[#66726F]">posts in the stream</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#101313]">
                      {authors.length}
                    </p>
                    <p className="text-sm text-[#66726F]">active contributors</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#101313]">
                      {blogs?.filter(blog => blog.featureImage).length ?? 0}
                    </p>
                    <p className="text-sm text-[#66726F]">image-first posts</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#101313]">
                  Explore Tags
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {FEED_TOPICS.map(topic => (
                    <span
                      key={topic}
                      className="rounded-full bg-[#EEF7F4] px-3 py-2 text-xs font-semibold text-[#0B7C6B]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            <div className="overflow-hidden rounded-[30px] border border-[#DDE7E4] bg-white shadow-sm">
              <div className="border-b border-[#EDF2F0] px-5 py-4 md:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F7F3] text-sm font-black text-[#0B7C6B]">
                    LU
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#101313]">Start a post</p>
                    <p className="text-sm text-[#66726F]">
                      Share a review, a shelf photo, or a thought worth saving.
                    </p>
                  </div>
                  {isAuthenticated ? (
                    <Link href="/blogs/create">
                      <Button className="rounded-full bg-[#101313] px-5 hover:bg-[#1C2322]">
                        <PenSquare className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="rounded-full border-[#D2DEDA] px-5 text-[#101313]"
                      >
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid gap-3 px-5 py-4 text-sm text-[#66726F] md:grid-cols-3 md:px-6">
                <div className="rounded-2xl bg-[#F6FAF8] px-4 py-3">
                  Post with a feature image for more attention in the feed.
                </div>
                <div className="rounded-2xl bg-[#F6FAF8] px-4 py-3">
                  Keep headlines sharp so the feed scans fast.
                </div>
                <div className="rounded-2xl bg-[#F6FAF8] px-4 py-3">
                  Serif, sans, or mono: tune the post tone before publishing.
                </div>
              </div>
            </div>

            {!blogs || blogs.length === 0 ? (
              <div className="rounded-[30px] border border-[#DDE7E4] bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B7C6B]">
                  Nothing Yet
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-[#101313]">
                  The feed is waiting for the first post.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#66726F]">
                  Be the first to drop a reading note, book reaction, or visual
                  shelf update for the Lumora community.
                </p>
              </div>
            ) : (
              blogs.map(blog => (
                <article
                  key={blog.id}
                  className="overflow-hidden rounded-[30px] border border-[#DDE7E4] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(16,25,23,0.08)]"
                >
                  <div className="px-5 py-5 md:px-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0B7C6B,#17BD8D)] text-sm font-black text-white shadow-[0_10px_24px_rgba(11,124,107,0.24)]">
                        {getAuthorInitials(
                          blog.author.firstName,
                          blog.author.lastName
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-bold text-[#101313]">
                            {blog.author.firstName} {blog.author.lastName}
                          </span>
                          <span className="text-sm text-[#8B9794]">
                            {getAuthorHandle(
                              blog.author.firstName,
                              blog.author.lastName
                            )}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[#CCD8D4]" />
                          <span className="text-sm text-[#8B9794]">
                            {getRelativeBlogTime(blog.createdAt)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#EEF7F4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B7C6B]">
                            Feed Post
                          </span>
                          {blog.visibility !== 'PUBLIC' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E8] px-3 py-1 text-xs font-semibold text-[#A36005]">
                              {getBlogVisibilityLabel(blog.visibility)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7F6] px-3 py-1 text-xs font-semibold text-[#66726F]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {getEstimatedReadTime(blog.content)}
                          </span>
                          {blog.featureImage && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E8] px-3 py-1 text-xs font-semibold text-[#A36005]">
                              <ImageIcon className="h-3.5 w-3.5" />
                              Photo post
                            </span>
                          )}
                        </div>

                        <WriterActions
                          status={relationshipMap.get(blog.author.id)}
                          isAuthenticated={isAuthenticated}
                          onFollow={() => followWriter.mutate(blog.author.id)}
                          onUnfollow={() =>
                            unfollowWriter.mutate(blog.author.id)
                          }
                          onAddFriend={() => addFriend.mutate(blog.author.id)}
                          onRemoveFriend={() =>
                            removeFriend.mutate(blog.author.id)
                          }
                          isFollowPending={
                            (followWriter.isPending &&
                              followWriter.variables === blog.author.id) ||
                            (unfollowWriter.isPending &&
                              unfollowWriter.variables === blog.author.id)
                          }
                          isFriendPending={
                            (addFriend.isPending &&
                              addFriend.variables === blog.author.id) ||
                            (removeFriend.isPending &&
                              removeFriend.variables === blog.author.id)
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <Link href={`/blogs/${blog.id}`}>
                        <h2 className="text-2xl font-black tracking-tight text-[#101313] transition-colors hover:text-[#0B7C6B] md:text-[2rem]">
                          {blog.title}
                        </h2>
                      </Link>
                      <p
                        className={cn(
                          'mt-4 text-[15px] leading-8 text-[#33403D]',
                          getBlogFontClass(blog.fontFamily)
                        )}
                      >
                        {getPlainTextExcerpt(blog.content, blog.featureImage ? 210 : 280)}
                      </p>
                    </div>
                  </div>

                  {blog.featureImage && (
                    <Link href={`/blogs/${blog.id}`} className="block">
                      <div className="aspect-[16/9] overflow-hidden border-y border-[#EDF2F0] bg-[#F6FAF8]">
                        <img
                          src={blog.featureImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#66726F]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7F6] px-3 py-2">
                        <MessageCircle className="h-4 w-4 text-[#0B7C6B]" />
                        Open thread
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7F6] px-3 py-2">
                        <Bookmark className="h-4 w-4 text-[#101313]" />
                        Save for later
                      </span>
                    </div>
                    <Link
                      href={`/blogs/${blog.id}`}
                      className="inline-flex items-center rounded-full bg-[#101313] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1C2322]"
                    >
                      Read post
                    </Link>
                  </div>
                </article>
              ))
            )}
          </main>

          <aside>
            <div className="sticky top-24 space-y-5">
              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#F97316]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#101313]">
                    Active Writers
                  </p>
                </div>
                <div className="mt-5 space-y-4">
                  {authors.slice(0, 4).map(author => (
                    <div
                      key={author.id}
                      className="rounded-2xl bg-[#F8FBFA] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#101313] text-sm font-black text-white">
                          {getAuthorInitials(author.firstName, author.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#101313]">
                            {author.firstName} {author.lastName}
                          </p>
                          <p className="text-sm text-[#66726F]">
                            {getAuthorHandle(author.firstName, author.lastName)}
                          </p>
                        </div>
                      </div>

                      <WriterActions
                        status={relationshipMap.get(author.id)}
                        isAuthenticated={isAuthenticated}
                        onFollow={() => followWriter.mutate(author.id)}
                        onUnfollow={() => unfollowWriter.mutate(author.id)}
                        onAddFriend={() => addFriend.mutate(author.id)}
                        onRemoveFriend={() => removeFriend.mutate(author.id)}
                        isFollowPending={
                          (followWriter.isPending &&
                            followWriter.variables === author.id) ||
                          (unfollowWriter.isPending &&
                            unfollowWriter.variables === author.id)
                        }
                        isFriendPending={
                          (addFriend.isPending &&
                            addFriend.variables === author.id) ||
                          (removeFriend.isPending &&
                            removeFriend.variables === author.id)
                        }
                      />
                    </div>
                  ))}
                  {authors.length === 0 && (
                    <p className="text-sm text-[#66726F]">
                      Writer profiles will appear as soon as people start
                      posting.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#DDE7E4] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#0B7C6B]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#101313]">
                    Posting Style
                  </p>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#66726F]">
                  <li>Lead with one strong idea, not a full essay opening.</li>
                  <li>Add a feature image when the post should stop the scroll.</li>
                  <li>Pick a reading font that matches the tone of the post.</li>
                </ul>
                <Link href="/blogs/create" className="mt-5 inline-flex">
                  <Button className="rounded-full bg-[#0B7C6B] px-5 hover:bg-[#096B5B]">
                    Create your post
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
