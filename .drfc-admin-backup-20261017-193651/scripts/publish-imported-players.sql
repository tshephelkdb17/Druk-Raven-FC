-- Run only after the optional_player_photos migration and the legacy import.
UPDATE club."Player" AS p
SET status='PUBLISHED', "updatedAt"=now()
WHERE p."legacyId" IN (SELECT id FROM public.players)
  AND p.status='DRAFT'
RETURNING p.name,p.number,p.status;
