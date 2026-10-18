-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "club";

-- CreateEnum
CREATE TYPE "club"."Position" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD');

-- CreateEnum
CREATE TYPE "club"."StaffGroup" AS ENUM ('EXECUTIVE', 'COACHING', 'MEDICAL', 'KIT');

-- CreateEnum
CREATE TYPE "club"."Publication" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "club"."GallerySlot" AS ENUM ('ONE', 'TWO', 'THREE');

-- CreateEnum
CREATE TYPE "club"."MediaState" AS ENUM ('PENDING', 'READY', 'REJECTED');

-- CreateEnum
CREATE TYPE "club"."VideoSource" AS ENUM ('UPLOAD', 'YOUTUBE', 'VIMEO');

-- CreateEnum
CREATE TYPE "club"."VideoCategory" AS ENUM ('HIGHLIGHTS', 'TRAINING', 'INTERVIEWS', 'CLUB');

-- CreateTable
CREATE TABLE "club"."Admin" (
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "club"."MediaAsset" (
    "id" UUID NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "state" "club"."MediaState" NOT NULL DEFAULT 'PENDING',
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."Player" (
    "id" UUID NOT NULL,
    "legacyId" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "position" "club"."Position" NOT NULL,
    "nationality" TEXT,
    "dateOfBirth" DATE,
    "heightCm" INTEGER,
    "biography" TEXT NOT NULL DEFAULT '',
    "portraitId" UUID,
    "status" "club"."Publication" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."PlayerGalleryImage" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "slot" "club"."GallerySlot" NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PlayerGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."Staff" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "group" "club"."StaffGroup" NOT NULL,
    "biography" TEXT NOT NULL DEFAULT '',
    "portraitId" UUID,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "club"."Publication" NOT NULL DEFAULT 'DRAFT',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."Video" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "club"."VideoCategory" NOT NULL,
    "source" "club"."VideoSource" NOT NULL,
    "providerId" TEXT,
    "assetId" UUID,
    "thumbnailId" UUID NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "status" "club"."Publication" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."Match" (
    "id" UUID NOT NULL,
    "legacyId" UUID,
    "opponent" TEXT NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "home" BOOLEAN NOT NULL,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "goalsFor" INTEGER,
    "goalsAgainst" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club"."PlayerMatchStat" (
    "playerId" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerMatchStat_pkey" PRIMARY KEY ("playerId","matchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_objectKey_key" ON "club"."MediaAsset"("objectKey");

-- CreateIndex
CREATE INDEX "MediaAsset_state_createdAt_idx" ON "club"."MediaAsset"("state", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Player_legacyId_key" ON "club"."Player"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_slug_key" ON "club"."Player"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Player_number_key" ON "club"."Player"("number");

-- CreateIndex
CREATE INDEX "Player_status_position_number_idx" ON "club"."Player"("status", "position", "number");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGalleryImage_playerId_slot_key" ON "club"."PlayerGalleryImage"("playerId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGalleryImage_playerId_assetId_key" ON "club"."PlayerGalleryImage"("playerId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_slug_key" ON "club"."Staff"("slug");

-- CreateIndex
CREATE INDEX "Staff_status_group_sortOrder_idx" ON "club"."Staff"("status", "group", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "club"."Video"("slug");

-- CreateIndex
CREATE INDEX "Video_status_publishedAt_id_idx" ON "club"."Video"("status", "publishedAt", "id");

-- CreateIndex
CREATE INDEX "Video_status_category_publishedAt_idx" ON "club"."Video"("status", "category", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_legacyId_key" ON "club"."Match"("legacyId");

-- CreateIndex
CREATE INDEX "Match_kickoff_id_idx" ON "club"."Match"("kickoff", "id");

-- CreateIndex
CREATE INDEX "PlayerMatchStat_matchId_idx" ON "club"."PlayerMatchStat"("matchId");

-- AddForeignKey
ALTER TABLE "club"."Player" ADD CONSTRAINT "Player_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."PlayerGalleryImage" ADD CONSTRAINT "PlayerGalleryImage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "club"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."PlayerGalleryImage" ADD CONSTRAINT "PlayerGalleryImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."Staff" ADD CONSTRAINT "Staff_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."Video" ADD CONSTRAINT "Video_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."Video" ADD CONSTRAINT "Video_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "club"."MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "club"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club"."PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "club"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

