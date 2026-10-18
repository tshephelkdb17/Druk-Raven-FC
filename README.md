# DRFC Next.js starter

A separate React/Next.js starter for Druk Raven Football Club. It reuses the
media supplied in the Flutter ZIP and implements the requested red/charcoal
club design. It does not replace or change your existing Flutter project or
live Supabase data.

## Run the design preview

Use Node.js 22.12+ (Node 22 LTS recommended). Open this `drfc-next` folder in
Android Studio or VS Code, then use its terminal:

```bash
cp .env.example .env
npm ci
npm run dev
```

Open **http://localhost:3000**. This is a Node/React project; do not run Flutter
commands in this folder. No database credentials are needed for the preview.

The preview uses your club logo, team photo, two supplied player photos and one
real club video. Player names/stats and staff roles are explicitly preview
fixtures, not a copy of the live roster. Missing action photos remain empty;
no duplicate images or fictional films were added to fill the design.

## What is included

- Next.js App Router, TypeScript, Tailwind 4, Node route handlers.
- Sticky two-tier navigation and expandable Club / News / DRFC TV / Matches /
  Squad / Shop menus; mobile navigation and keyboard access.
- Red `#C70101`, charcoal `#0c0c0c` / `#111111`, bold white type, sharp-edged cards.
- First team grouped by position; staff grouped by executive / coaching /
  medical / kit roles; hover and focus treatments.
- Player profile hero with primary portrait, number, vitals, goals and assists.
- Three-slot action gallery and keyboard-accessible native-dialog lightbox.
- DRFC TV grid: 4 desktop columns / 2 mobile columns, category/search controls,
  thumbnails, play anchors, duration stamps and individual video pages.
- Muted native-video playback while visible, reduced-motion preference,
  pause/mute controls and a native seek bar on film pages.
- Admin sign-in and video upload/embed form; protected API handlers.
- Prisma models, initial PostgreSQL migration, constraints, private-media setup
  SQL, and a runtime database-role script.
- Basic PWA manifest, offline fallback and service-worker registration.
- Unit/validation, real PostgreSQL-engine constraint, and Playwright tests.

## Read the blueprint

Start with **docs/ARCHITECTURE.md**. It includes the component hierarchy,
relational model, request flows, API contract, scalability plan, security
boundaries and implementation limits. **docs/BACKEND_SETUP.md** covers Supabase
and the migration approach. **docs/VALIDATION.md** records the checks performed.

## Main files to edit

| Purpose | File |
| --- | --- |
| Colours, fonts, shared styling | `src/app/globals.css` |
| Navigation and mega-menu | `src/components/site-header.tsx` |
| Squad/staff layout | `src/components/squad-directory.tsx` |
| Player profile | `src/app/squad/[slug]/page.tsx` |
| Three-photo lightbox | `src/components/player-gallery.tsx` |
| Compact DRFC TV grid | `src/components/video-grid.tsx` |
| Video admin form | `src/components/admin-video-studio.tsx` |
| Demo content | `src/lib/demo.ts` |
| Database models | `prisma/schema.prisma` |
| Exact-three database invariant | `prisma/migrations/202610160002_invariants/migration.sql` |

## Check and build

```bash
npm run db:validate
npm run typecheck
npm test
npx playwright install chromium
npm run build
npm run test:e2e
npm start
```

The backend requires configuration before live uploads or publishing. Demo mode
rejects every admin write. Shop and News are honest placeholder routes, not an
implemented checkout or news CMS. Read the blueprint's scope table before
planning a production launch.
# Druk-Raven-FC
