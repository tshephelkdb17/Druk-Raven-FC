-- Add invariants Prisma's relational schema cannot express alone.
ALTER TABLE club."Player" ADD CONSTRAINT player_number_range CHECK (number BETWEEN 1 AND 99);
ALTER TABLE club."Player" ADD CONSTRAINT player_height_range CHECK ("heightCm" IS NULL OR "heightCm" BETWEEN 80 AND 250);
ALTER TABLE club."MediaAsset" ADD CONSTRAINT media_positive_bytes CHECK (bytes > 0 AND bytes <= 52428800);
ALTER TABLE club."Video" ADD CONSTRAINT video_positive_duration CHECK ("durationSeconds" > 0);
ALTER TABLE club."Video" ADD CONSTRAINT video_source_exclusive CHECK (
 (source='UPLOAD' AND "assetId" IS NOT NULL AND "providerId" IS NULL) OR
 (source='YOUTUBE' AND "assetId" IS NULL AND "providerId" IS NOT NULL AND "providerId" ~ '^[A-Za-z0-9_-]{11}$') OR
 (source='VIMEO' AND "assetId" IS NULL AND "providerId" IS NOT NULL AND "providerId" ~ '^[0-9]{1,12}$'));
ALTER TABLE club."Video" ADD CONSTRAINT published_video_date CHECK (status!='PUBLISHED' OR "publishedAt" IS NOT NULL);
ALTER TABLE club."PlayerMatchStat" ADD CONSTRAINT contribution_nonnegative CHECK (goals >= 0 AND assists >= 0);
ALTER TABLE club."Match" ADD CONSTRAINT match_score_state CHECK (
 (finished AND "goalsFor" IS NOT NULL AND "goalsAgainst" IS NOT NULL AND "goalsFor">=0 AND "goalsAgainst">=0) OR
 (NOT finished AND "goalsFor" IS NULL AND "goalsAgainst" IS NULL));

-- Serialize gallery edits against publication and prevent a row moving parents.
CREATE FUNCTION club.lock_gallery_parent() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid;
BEGIN
 IF TG_OP='UPDATE' AND NEW."playerId"<>OLD."playerId" THEN
   RAISE EXCEPTION 'Gallery rows cannot move between players';
 END IF;
 IF TG_OP='DELETE' THEN target:=OLD."playerId"; ELSE target:=NEW."playerId"; END IF;
 PERFORM id FROM club."Player" WHERE id=target FOR UPDATE;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER lock_gallery_parent BEFORE INSERT OR UPDATE OR DELETE ON club."PlayerGalleryImage"
FOR EACH ROW EXECUTE FUNCTION club.lock_gallery_parent();

CREATE FUNCTION club.require_three_gallery_images() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid; player_status club."Publication"; portrait uuid; total integer;
BEGIN
 IF TG_TABLE_NAME='Player' THEN target:=NEW.id;
 ELSIF TG_OP='DELETE' THEN target:=OLD."playerId";
 ELSE target:=NEW."playerId"; END IF;
 SELECT status,"portraitId" INTO player_status,portrait FROM club."Player" WHERE id=target FOR UPDATE;
 -- Parent deletion cascades are allowed. Drafts may have 0, 1, 2, or 3 slots.
 IF NOT FOUND OR player_status<>'PUBLISHED' THEN RETURN NULL; END IF;
 SELECT count(*) INTO total FROM club."PlayerGalleryImage" WHERE "playerId"=target;
 IF total<>3 THEN RAISE EXCEPTION 'Published player must have exactly three gallery images'; END IF;
 IF portrait IS NULL OR EXISTS(SELECT 1 FROM club."PlayerGalleryImage" WHERE "playerId"=target AND "assetId"=portrait) THEN
   RAISE EXCEPTION 'Primary portrait and three additional gallery images are required';
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER published_player_gallery AFTER INSERT OR UPDATE ON club."Player"
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION club.require_three_gallery_images();
CREATE CONSTRAINT TRIGGER changed_player_gallery AFTER INSERT OR UPDATE OR DELETE ON club."PlayerGalleryImage"
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION club.require_three_gallery_images();

-- club is server-only. Do not expose it through Supabase's Data API schema list.
REVOKE ALL ON SCHEMA club FROM PUBLIC;
ALTER TABLE club."Admin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."Player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."PlayerGalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."Match" ENABLE ROW LEVEL SECURITY;
ALTER TABLE club."PlayerMatchStat" ENABLE ROW LEVEL SECURITY;
