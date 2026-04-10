ALTER TABLE "blog_posts"
ADD COLUMN "featureImage" TEXT,
ADD COLUMN "fontFamily" TEXT NOT NULL DEFAULT 'modern-sans';

CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");
CREATE INDEX "blog_posts_createdAt_idx" ON "blog_posts"("createdAt");
