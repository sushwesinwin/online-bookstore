ALTER TABLE "blog_posts"
ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';

CREATE INDEX "blog_posts_visibility_idx" ON "blog_posts"("visibility");
