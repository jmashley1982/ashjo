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

Single-page artist website for **Ash Johansen** (www.ashjo.com) — dark punk aesthetic, hot pink (`#ff1a8c`). Lives in `artifacts/artist-site` (React + Vite). Sections: hero (with a sticker linking to the latest music video), MUSIC (self-hosted player), VIDEOS, PICS, ABOUT, FRENZ, CONTACT. Deployed as a static bundle (`ash-johansen-website.tar.gz`) for cPanel hosting.

### Self-hosted music player

Music streams directly from the site (no external streaming-service embeds/tabs). Releases are defined in the `RELEASES` array in `artifacts/artist-site/src/pages/Home.tsx` (newest first). A sticky bottom now-playing bar provides play/pause, prev/next, and a seek slider; it is mobile-friendly. The release switcher only renders when more than one release exists.

Singles and EPs use the same entry shape as albums — the card meta line pluralizes `track`/`tracks` from `tracks.length`, and the play button reads "Play single" for a one-track release.

**To add a release:**
1. Web-optimize the audio to ~192kbps MP3 and drop the files in `artifacts/artist-site/public/audio/<slug>/` (named `NN-track-slug.mp3`).
2. Resize the cover to ~900px and save as `artifacts/artist-site/public/album-<slug>.webp` (the `album-` prefix is used for every release kind).
3. **Prepend** a new entry to the `RELEASES` array (newest release goes at the top).
4. Optional fields: `kind` (`"Single" | "EP" | "Album"`) shows in the card meta line, and `streamingDate` (e.g. `"8.19"`) marks a release as not-yet-on-streaming.
5. Rebuild the tarball (see "Building the distributable").

**The MUSIC-section announcement block** is driven entirely by `streamingDate` on the newest release. Setting it renders the "new single / we're back on streaming" card above the release switcher plus an "on streaming <date>" stamp on the release card; clearing the field removes both. There is no separate announcement component to clean up.

### Building the distributable

```
cd artifacts/artist-site && npx vite build --config vite.config.static.ts \
  && cp -r public/. dist/static/ \
  && cd dist && tar -czf /home/runner/workspace/ash-johansen-website.tar.gz -C static .
```
Upload the contents of `ash-johansen-website.tar.gz` to the cPanel web root.

## User preferences

- **No site-wide marquee/ticker banner.** Announcements belong inside the relevant section (e.g. the MUSIC section), styled like the rest of the page. The nav is pinned at `top-0`; don't reintroduce a bar above it.
- **Unreleased dates are written as future dates** ("out 8.19", "hits streaming 8.19"), never "out now", until the date actually passes.

## Gotchas

- **No image tooling is installed** in a fresh container — no `sharp`, `magick`/`convert`, `cwebp`, or `ffmpeg`. For cover conversion, `pip3 install --break-system-packages pillow` and resize with PIL; don't add `sharp` to the workspace for a one-shot conversion.
- **The dev server throws without `PORT` and `BASE_PATH`** — `vite.config.ts` requires both on `serve`. Use `PORT=19222 BASE_PATH=/ pnpm --filter @workspace/artist-site run dev`.
- **`vite.config.static.ts` sets `emptyOutDir: true`**, so `cp -r public/. dist/static/` must run *after* the build, not before.
- **The distributable command's tarball path (`/home/runner/workspace/...`) is Replit-specific** and won't exist elsewhere; use a repo-relative path outside Replit.
- `ash-johansen-website.tar.gz` is tracked via **Git LFS**. Regenerating it in a container without LFS replaces the pointer with a real blob — only rebuild it when you actually intend to ship.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
