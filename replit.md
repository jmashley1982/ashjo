# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

Single-page artist website for **Ash Johansen** (www.ashjo.com) — dark punk aesthetic, hot pink (`#ff1a8c`). Lives in `artifacts/artist-site` (React + Vite). Sections: hero (with a "PLAY ME" demo overlay), MUSIC (self-hosted album player), VIDEOS, PICS, ABOUT, FRENZ, CONTACT. Deployed as a static bundle (`ash-johansen-website.tar.gz`) for cPanel hosting.

### Self-hosted music player

Music streams directly from the site (no external streaming-service embeds/tabs). Albums are defined in the `RELEASES` array in `artifacts/artist-site/src/pages/Home.tsx` (newest first). A sticky bottom now-playing bar provides play/pause, prev/next, and a seek slider; it is mobile-friendly. The album switcher only renders when more than one release exists.

**To add an album:**
1. Web-optimize the audio to ~192kbps MP3 and drop the files in `artifacts/artist-site/public/audio/<slug>/` (named `NN-track-slug.mp3`).
2. Resize the cover to ~900px and save as `artifacts/artist-site/public/album-<slug>.webp`.
3. **Prepend** a new entry to the `RELEASES` array (newest release goes at the top).
4. Rebuild the tarball (see "Building the distributable").

### Building the distributable

```
cd artifacts/artist-site && npx vite build --config vite.config.static.ts \
  && cp -r public/. dist/static/ \
  && cd dist && tar -czf /home/runner/workspace/ash-johansen-website.tar.gz -C static .
```
Upload the contents of `ash-johansen-website.tar.gz` to the cPanel web root.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
