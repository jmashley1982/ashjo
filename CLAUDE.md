# ashjo

Monorepo for **www.ashjo.com** — the Ash Johansen artist site, plus a small API server and a couple of side tools.

## Run & Operate

Each app picks a sensible default port; set `PORT` (and `BASE_PATH` for the Vite apps) to override.

| App | Command | Default port |
|---|---|---|
| Artist site | `pnpm --filter @workspace/artist-site run dev` | 19222 |
| API server | `pnpm --filter @workspace/api-server run dev` | 8080 |
| Mockup sandbox | `pnpm --filter @workspace/mockup-sandbox run dev` | 8081 (base `/__mockup`) |
| Suno prompt tool | `cd artifacts/suno-tool && pip install -r requirements.txt && python3 app.py` | 8082 |

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

Env vars: `DATABASE_URL` (Postgres connection string, for the db package) and `ALLOWED_ORIGINS` (optional, comma-separated extra CORS origins for the API server — `ashjo.com` and `www.ashjo.com` are always allowed).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/artist-site/` — the public website (React + Vite). Nearly all of it is `src/pages/Home.tsx`; custom CSS is `src/index.css`.
- `artifacts/api-server/` — Express 5 API (`/health`, `/api/youtube-feed`, `/api/instagram-feed`).
- `artifacts/mockup-sandbox/`, `artifacts/suno-tool/` — side tools, not part of the public site.
- `lib/` — shared packages (db, api-spec, api-zod). Currently scaffolding; the site does not read from the database.
- `attached_assets/` — source images, audio masters, and pasted notes. Some are historical and no longer referenced.

## Architecture decisions

- **Hosting is plain static.** The site is built to `dist/static/` and uploaded to cPanel. There is no platform-specific config in the repo — no build archive, no run manifests. Ports and base paths come from `PORT` / `BASE_PATH` with defaults baked into each Vite config.
- **The site ships no backend.** The API server exists but the site fetches YouTube/Instagram through public CORS proxies client-side, so the static bundle works with nothing else deployed.
- **Music is self-hosted, not embedded.** See below.

## Product

Single-page artist website for **Ash Johansen** (www.ashjo.com) — dark punk aesthetic, hot pink (`#ff1a8c`). Lives in `artifacts/artist-site` (React + Vite). Sections: hero (with a sticker linking to the latest music video), MUSIC (self-hosted player), VIDEOS, PICS, ABOUT, FRENZ, CONTACT. Deployed as a static bundle to cPanel hosting.

### Self-hosted music player

Music streams directly from the site (no external streaming-service embeds/tabs). Releases are defined in the `RELEASES` array in `artifacts/artist-site/src/pages/Home.tsx` (newest first). A sticky bottom now-playing bar provides play/pause, prev/next, and a seek slider; it is mobile-friendly. The release switcher only renders when more than one release exists.

Singles and EPs use the same entry shape as albums — the card meta line pluralizes `track`/`tracks` from `tracks.length`, and the play button reads "Play single" for a one-track release.

**To add a release:**
1. Web-optimize the audio to ~192kbps MP3 and drop the files in `artifacts/artist-site/public/audio/<slug>/` (named `NN-track-slug.mp3`).
2. Resize the cover to ~900px and save as `artifacts/artist-site/public/album-<slug>.webp` (the `album-` prefix is used for every release kind).
3. **Prepend** a new entry to the `RELEASES` array (newest release goes at the top).
4. Optional fields: `kind` (`"Single" | "EP" | "Album"`) shows in the card meta line, and `streamingDate` (e.g. `"8.19"`) marks a release as not-yet-on-streaming.
5. Rebuild the static bundle (see "Building for deploy").

**The MUSIC-section announcement block** is driven entirely by `streamingDate` on the newest release. Setting it renders the "new single / we're back on streaming" card above the release switcher plus an "on streaming <date>" stamp on the release card; clearing the field removes both. There is no separate announcement component to clean up.

### Deploying — READ THIS FIRST

**www.ashjo.com is a Cloudflare Worker named `ashjo`** (account-level Worker, static assets served via an `env.ASSETS` binding). It is **not** cPanel — older notes in this repo said cPanel and they were wrong.

**Pushing to `main` does NOT deploy.** There is no GitHub Action, no `.cpanel.yml`, no build hook — GitHub and the live site are not connected. The site only changes when someone runs a deploy. Never tell the user a change is live because it was merged.

Build, then deploy:
```
cd artifacts/artist-site && npx vite build --config vite.config.static.ts \
  && cp -r public/. dist/static/
npx wrangler deploy          # requires CLOUDFLARE_API_TOKEN
```

**Deployment requires `CLOUDFLARE_API_TOKEN` in the environment.** `wrangler login` cannot be used from an agent session — it needs an interactive browser. If the token is missing, `wrangler whoami` reports "not authenticated" and there is no workaround from inside the container. Say so immediately rather than looking for one; the fix is for the user to add the token to their Claude Code environment variables, where it persists across sessions.

Do **not** commit build archives. `dist/` is gitignored and stays that way.

## User preferences

- **Ship it — don't stage it.** "Do it" means the change is live on www.ashjo.com, not staged for review. Commit, fast-forward `main`, push, **then deploy** (see "Deploying"). No pull requests, no "ready for you to merge", no handing back a list of steps to run. If something genuinely blocks the deploy, say that in the first sentence — don't bury it after a summary of what was merged.
- **The user is not an engineer.** Don't explain internals unless asked, don't offer menus of options, and never end with homework. Pick the sensible path and do it.
- **No site-wide marquee/ticker banner.** Announcements belong inside the relevant section (e.g. the MUSIC section), styled like the rest of the page. The nav is pinned at `top-0`; don't reintroduce a bar above it.
- **Unreleased dates are written as future dates** ("out 8.19", "hits streaming 8.19"), never "out now", until the date actually passes.

## Gotchas

- **No image tooling is installed** in a fresh container — no `sharp`, `magick`/`convert`, `cwebp`, or `ffmpeg`. For cover conversion, `pip3 install --break-system-packages pillow` and resize with PIL; don't add `sharp` to the workspace for a one-shot conversion.
- **The dev server throws without `PORT` and `BASE_PATH`** — `vite.config.ts` requires both on `serve`. Use `PORT=19222 BASE_PATH=/ pnpm --filter @workspace/artist-site run dev`.
- **`vite.config.static.ts` sets `emptyOutDir: true`**, so `cp -r public/. dist/static/` must run *after* the build, not before.
- **Never commit build archives.** Deploy by uploading `dist/static/` directly; no `.tar.gz` goes in the repo.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
