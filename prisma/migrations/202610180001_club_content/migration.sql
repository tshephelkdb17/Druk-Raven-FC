CREATE TABLE "club"."ClubContent" (
 "id" UUID NOT NULL,
 "kind" TEXT NOT NULL,
 "slug" TEXT NOT NULL,
 "title" TEXT NOT NULL,
 "summary" TEXT NOT NULL DEFAULT '',
 "body" TEXT NOT NULL DEFAULT '',
 "imageId" UUID,
 "videoId" UUID,
 "status" "club"."Publication" NOT NULL DEFAULT 'DRAFT',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ClubContent_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "ClubContent_kind_check" CHECK ("kind" IN ('NEWS','HOME')),
 CONSTRAINT "ClubContent_home_slug_check" CHECK ("kind" <> 'HOME' OR "slug" = 'homepage'),
 CONSTRAINT "ClubContent_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "ClubContent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ClubContent_kind_slug_key" ON "club"."ClubContent"("kind","slug");
CREATE INDEX "ClubContent_kind_status_createdAt_idx" ON "club"."ClubContent"("kind","status","createdAt");
ALTER TABLE "club"."ClubContent" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "club"."ClubContent" FROM PUBLIC;
