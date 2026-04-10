export const BLOG_FONT_OPTIONS = [
  {
    value: 'modern-sans',
    label: 'Roboto',
    preview: 'Clean and readable',
    className: 'font-blog-modern-sans',
  },
  {
    value: 'editorial-serif',
    label: 'Editorial Serif',
    preview: 'Magazine-style and elegant',
    className: 'font-blog-editorial-serif',
  },
  {
    value: 'literary-serif',
    label: 'Literary Serif',
    preview: 'Warm and bookish',
    className: 'font-blog-literary-serif',
  },
  {
    value: 'classic-mono',
    label: 'Classic Mono',
    preview: 'Structured and technical',
    className: 'font-blog-classic-mono',
  },
] as const;

export type BlogFontFamily = (typeof BLOG_FONT_OPTIONS)[number]['value'];
export type BlogPostVisibility =
  | 'PUBLIC'
  | 'FOLLOWERS'
  | 'FRIENDS'
  | 'PRIVATE';

export const DEFAULT_BLOG_FONT_FAMILY: BlogFontFamily = 'modern-sans';
export const DEFAULT_BLOG_POST_VISIBILITY: BlogPostVisibility = 'PUBLIC';

export const BLOG_VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Visible to everyone in the feed.',
  },
  {
    value: 'FOLLOWERS',
    label: 'Followers',
    description: 'Visible to people who follow you.',
  },
  {
    value: 'FRIENDS',
    label: 'Friends',
    description: 'Visible only to people in your friends list.',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Visible only to you.',
  },
] as const;

export function getBlogFontClass(fontFamily?: string): string {
  return (
    BLOG_FONT_OPTIONS.find(option => option.value === fontFamily)?.className ??
    BLOG_FONT_OPTIONS.find(option => option.value === DEFAULT_BLOG_FONT_FAMILY)!
      .className
  );
}

export function getBlogVisibilityLabel(
  visibility?: BlogPostVisibility
): string {
  return (
    BLOG_VISIBILITY_OPTIONS.find(option => option.value === visibility)?.label ??
    BLOG_VISIBILITY_OPTIONS[0].label
  );
}

export function getPlainTextExcerpt(
  html: string,
  maxLength: number = 180
): string {
  const plainText = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

export function getAuthorInitials(
  firstName?: string,
  lastName?: string
): string {
  const initials = `${firstName?.trim().charAt(0) ?? ''}${lastName?.trim().charAt(0) ?? ''}`.toUpperCase();

  return initials || 'LB';
}

export function getAuthorHandle(
  firstName?: string,
  lastName?: string
): string {
  const parts = [firstName, lastName]
    .map(value =>
      value
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
    )
    .filter(Boolean);

  return `@${parts.join('') || 'lumorabooks'}`;
}

export function getEstimatedReadTime(html: string): string {
  const plainText = getPlainTextExcerpt(html, Number.MAX_SAFE_INTEGER);
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(wordCount / 200));

  return `${minutes} min read`;
}

export function getRelativeBlogTime(date: string): string {
  const createdAt = new Date(date).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
