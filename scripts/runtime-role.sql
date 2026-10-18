-- Run as database owner after migrations, in a development database first.
-- Give your separately-created LOGIN role membership in club_backend.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='club_backend') THEN CREATE ROLE club_backend NOLOGIN; END IF;
END $$;
GRANT USAGE ON SCHEMA club TO club_backend;
GRANT SELECT ON ALL TABLES IN SCHEMA club TO club_backend;
GRANT INSERT,UPDATE,DELETE ON club."MediaAsset",club."Player",club."PlayerGalleryImage",club."Staff",club."Video",club."Match",club."PlayerMatchStat" TO club_backend;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['Admin','MediaAsset','Player','PlayerGalleryImage','Staff','Video','Match','PlayerMatchStat'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS backend_access ON club.%I',t);
  EXECUTE format('CREATE POLICY backend_access ON club.%I TO club_backend USING (true) WITH CHECK (true)',t);
 END LOOP;
END $$;
-- Example (replace role name): GRANT club_backend TO your_runtime_login;
-- Admin membership remains writable only by the database owner, not this role.
