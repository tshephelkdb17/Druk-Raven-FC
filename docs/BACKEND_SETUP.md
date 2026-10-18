# Backend setup and migration from the Flutter app

## 1. Keep preview and live data separate

The supplied Flutter app uses Supabase tables in `public`. This Next.js starter
uses new tables in `club`. It does not read or migrate live data automatically.
Use a NEW development database/project to validate this starter first. Keep the
Flutter app running against its current backend until the import and cutover
are verified.

The old `supabase-config.json` contains a public URL/key, not a PostgreSQL
connection string. Prisma needs DATABASE_URL and DIRECT_URL, which stay on the
server. Do not paste connection strings or service-role keys into client code.

## 2. Configure the database

Copy `.env.example` to `.env` and fill:

- `DATA_MODE=database`
- `APP_ORIGIN=http://localhost:3000` locally; the exact HTTPS site origin when hosted.
- `DIRECT_URL`: direct or session-pooler PostgreSQL connection for migrations.
- `DATABASE_URL`: pooled runtime PostgreSQL connection, ideally a separate role.
- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project's HTTPS URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public publishable/anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Storage administrative credential.
- `SUPABASE_MEDIA_BUCKET=drfc-media`

Then run:

```bash
npm ci
npm run db:validate
npm run db:migrate
```

`db:migrate` applies the included initial schema and custom constraints. Do not
substitute `db push`: the exact-three publication triggers are handwritten SQL.

For a dedicated runtime role, run `scripts/runtime-role.sql` as the database
owner after migrations. Create your login role using your database's secure
credential workflow, grant it membership in `club_backend`, and put that role's
connection string in DATABASE_URL. Keep the migration-owner connection in
DIRECT_URL only. The runtime role can read Admin membership but cannot grant it.

Do not expose the `club` schema through the Supabase Data API. RLS is enabled;
server runtime policies are installed by the role script. Public browsers only
see explicitly selected fields through Next.js server components.

## 3. Configure Auth and Storage

Run `scripts/storage-setup.sql` in the development Supabase project's SQL Editor.
It creates a private bucket with allowed file types and a 50 MiB object cap. Do
not add anonymous storage insert/list/select policies. Signed upload tokens are
minted only after a verified administrator request.

Create an Auth user in Supabase, obtain its UUID, then run the owner-only script:

```bash
node --import tsx scripts/grant-admin.ts YOUR_SUPABASE_AUTH_USER_UUID
```

The existing Flutter `public.admins` membership is NOT automatically copied.
Use a development admin account initially. The script grants `club.Admin` access
to the supplied Auth UUID; it does not create the Auth user.

Start the app, visit `/admin`, sign in, select MP4 or YouTube/Vimeo, select a
thumbnail, enter metadata and choose draft/publish. The form uploads bytes
directly to Storage, verifies the upload, then saves the Video record.

## 4. Add players and staff

The starter includes protected create/list APIs rather than a complete roster
editor UI. Obtain a valid access token through the admin sign-in client and use
the API contract in ARCHITECTURE.md from a developer client. Never put a service
key in these browser requests.

Player creation stores a DRAFT. Upload one primary portrait and three additional
images through the media flow. Replace the gallery with the three image IDs,
then call the publish endpoint. Publishing without all three fails. Staff
records can be drafted/published through their create endpoint.

Staff groups are EXECUTIVE, COACHING, MEDICAL and KIT. Player positions are
GOALKEEPER, DEFENDER, MIDFIELDER and FORWARD.

## 5. Migration plan for existing DRFC data (not executed)

| Flutter source | New destination |
| --- | --- |
| public.players.id | Player.legacyId (retain stable mapping) |
| players.name / number / position / bio | Player.name / number / mapped enum / biography |
| players.photo_url or assets/players path | Upload to Storage, create MediaAsset, assign portraitId |
| public.matches | Match with legacyId and normalized result fields |
| matches.player_stats JSON rows | PlayerMatchStat using mapped player/match IDs |
| public.admins.user_id | Owner-reviewed club.Admin membership |
| bundled videos | Verified MediaAssets and Video metadata records |

Suggested sequence:

1. Export a backup and copy data to a staging database; retain a rollback plan.
2. Inventory actual player IDs/numbers, finished/scheduled scores and image paths.
3. Import players as drafts, preserving legacyId; normalise position enum values.
4. Import matches and map contributions. Check for deleted players, duplicate
   contributions and nonnegative goals/assists; compare computed totals against
   the existing app. Keep a separate historical-player mapping when needed.
5. Upload portraits and three distinct action photos for each profile. Existing
   players without gallery photos remain drafts under the new publication rule.
6. Validate record counts, totals, photo paths, roles and authorisation in staging.
7. Take a final export during a short editing freeze, repeat the import
   idempotently using legacyId, validate and switch the public URL.
8. Retain the Flutter deployment and backups until the cutover is accepted.

No automatic import is supplied because the ZIP contains source/media, not an
export of your live Supabase database. No database was contacted during creation
of this starter.

## 6. Hosting and operational setup

Build with production environment variables, then run `npm start` behind HTTPS
on a Node-capable host. The computer running Android Studio need not stay on
once deployed to hosting. This package does not create a hosting account or
publish a website.

Before public launch, configure the production runtime role, Auth settings,
storage limits, rate limiting, error monitoring, CSP, backup/restore procedures
and media processing appropriate to the intended content. The blueprint lists
which scale features remain extension points.
