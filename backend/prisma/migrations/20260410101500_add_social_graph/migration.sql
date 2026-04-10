CREATE TABLE "user_follows" (
  "id" TEXT NOT NULL,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_friendships" (
  "id" TEXT NOT NULL,
  "userOneId" TEXT NOT NULL,
  "userTwoId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_friendships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_follows_followerId_followingId_key" ON "user_follows"("followerId", "followingId");
CREATE INDEX "user_follows_followingId_idx" ON "user_follows"("followingId");

CREATE UNIQUE INDEX "user_friendships_userOneId_userTwoId_key" ON "user_friendships"("userOneId", "userTwoId");
CREATE INDEX "user_friendships_userTwoId_idx" ON "user_friendships"("userTwoId");

ALTER TABLE "user_follows"
ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_follows"
ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_friendships"
ADD CONSTRAINT "user_friendships_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_friendships"
ADD CONSTRAINT "user_friendships_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
