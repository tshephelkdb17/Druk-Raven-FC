ALTER TABLE club."Match" ADD COLUMN "status" club."Publication" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE club."Match" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
