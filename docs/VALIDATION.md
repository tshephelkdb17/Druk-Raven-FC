# Validation record

- Production build: `npm run build` passed, including TypeScript compilation.
- Prisma schema: `npm run db:validate` passed.
- Unit/database suite: 4 tests passed. PGlite executes the PostgreSQL migrations and checks exact-three publication, slot uniqueness, portrait exclusion and transactional gallery replacement. Other tests cover distinct gallery assets, embed allowlisting and video metadata validation.
- Production-server browser suite: 4 Chromium tests passed. Covers desktop navigation/grouping/profile, four-column TV grid, mobile two-column grid and viewport widths, reduced-motion playback/manual controls/offscreen pause, and rejection of demo admin writes.
- Visually inspected desktop home/squad and mobile TV screenshots. Fixed the mobile navigation CTA wrapping. Added a WebM fallback for the supplied H.264 club film after the headless browser lacked that codec.

## Limits

No live Supabase credentials were used. Auth, private Storage uploads and deployment must be verified against a staging Supabase project using BACKEND_SETUP.md. No live data was imported or modified. Safari/iOS, Firefox, load testing and a full accessibility audit have not been performed. The sample has one real video and two supplied portraits; full player names/statistics, staff content and three distinct action photos per player still need to be provided. The UI supports transparent portraits, but the supplied JPEGs retain their backgrounds.

This is an initial implementation and architecture starter, not a completed production migration. See ARCHITECTURE.md for implemented versus planned scope.
