-- Keep the existing deferred triggers, but allow zero to three photos.
CREATE OR REPLACE FUNCTION club.require_three_gallery_images() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid; portrait uuid;
BEGIN
 IF TG_TABLE_NAME='Player' THEN target:=NEW.id;
 ELSIF TG_OP='DELETE' THEN target:=OLD."playerId";
 ELSE target:=NEW."playerId"; END IF;
 SELECT "portraitId" INTO portrait FROM club."Player" WHERE id=target FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF portrait IS NOT NULL AND EXISTS(
  SELECT 1 FROM club."PlayerGalleryImage" WHERE "playerId"=target AND "assetId"=portrait
 ) THEN RAISE EXCEPTION 'Gallery photos must differ from the primary portrait'; END IF;
 RETURN NULL;
END $$;
-- The three-value slot enum and unique(playerId,slot) still cap photos at three.
