# ashjo

Monorepo for **www.ashjo.com** — the Ash Johansen artist site, plus a small API server and a couple of side tools.

> **Deploying is the thing people get wrong.** The live site is a Cloudflare Worker.
> Merging to `main` does not deploy. Jump to [Deploying](#deploying--read-this-first).

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

**Environment variables**

| Name | Used by | Required? |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `wrangler deploy` | **Yes, to deploy.** Without it nothing can reach the live site. |
| `INSTAGRAM_ACCESS_TOKEN` | Worker `/api/instagram-feed` | No — a Worker *secret*, set with `wrangler secret put`. Missing means an empty post list. |
| `DATABASE_URL` | `lib/db` only | No — nothing on the site reads the database. |
| `ALLOWED_ORIGINS` | local Express api-server | No — comma-separated extra CORS origins; `ashjo.com` and `www.ashjo.com` are always allowed. |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Site: React 18 + Vite 7 + Tailwind v4, routed with `wouter`
- Production runtime: Cloudflare Workers (static assets + three JSON endpoints)
- Local API (not deployed): Express 5
- DB: PostgreSQL + Drizzle ORM — scaffolding, unused by the site
- Validation: Zod (`zod/v4`), `drizzle-zod`

## Where things live

- `artifacts/artist-site/` — the public website (React + Vite). Nearly all of it is `src/pages/Home.tsx`; custom CSS is `src/index.css`.
- `artifacts/artist-site/worker/index.ts` — **the code that actually runs in production.** Serves static assets plus `/api/healthz`, `/api/youtube-feed`, `/api/instagram-feed`.
- `artifacts/artist-site/wrangler.jsonc` — deploy config for the `ashjo` Worker.
- `artifacts/api-server/` — a separate Express 5 app with the same three routes (`/healthz`, `/api/youtube-feed`, `/api/instagram-feed`). **Not deployed anywhere.** Editing it does not change the live site.
- `artifacts/mockup-sandbox/`, `artifacts/suno-tool/` — side tools, not part of the public site.
- `lib/` — shared packages (db, api-spec, api-zod). Scaffolding; the site does not read from the database.
- `attached_assets/` — source images, audio masters, and pasted notes. Some are historical and no longer referenced.

## Architecture decisions

- **Production is one Cloudflare Worker.** `worker/index.ts` handles three JSON routes and falls through to the `ASSETS` binding for everything else, stamping security headers on what it returns. The Worker is small; the site is the 200 MB of assets beside it.
- **The Express api-server is dead weight for the live site.** It duplicates the Worker's three routes for local use. If you change one, change both, or delete the Express one.
- **The page doesn't call its own API.** `Home.tsx` fetches the YouTube playlist client-side through public CORS proxies (corsproxy.io, then allorigins.win), so the site works even if the Worker routes fail. `FALLBACK_VIDEO_IDS` in `Home.tsx` is the last resort.
- **Music is self-hosted, not embedded.** See below.

## Product

Single-page artist website for **Ash Johansen** (www.ashjo.com) — dark punk aesthetic, hot pink (`#ff1a8c`). Lives in `artifacts/artist-site` (React + Vite). Sections: hero (with a sticker linking to the latest music video), MUSIC (self-hosted player), VIDEOS, PICS, ABOUT, FRENZ, CONTACT. Served in production by the `ashjo` Cloudflare Worker — see [Deploying](#deploying--read-this-first).

### Self-hosted music player

Music streams directly from the site (no external streaming-service embeds/tabs). Releases are defined in the `RELEASES` array in `artifacts/artist-site/src/pages/Home.tsx` (newest first). A sticky bottom now-playing bar provides play/pause, prev/next, and a seek slider; it is mobile-friendly. The release switcher only renders when more than one release exists.

Singles and EPs use the same entry shape as albums — the card meta line pluralizes `track`/`tracks` from `tracks.length`, and the play button reads "Play single" for a one-track release.

**To add a release:**
1. Web-optimize the audio to ~192kbps MP3 and drop the files in `artifacts/artist-site/public/audio/<slug>/` (named `NN-track-slug.mp3`).
2. Resize the cover to ~900px and save as `artifacts/artist-site/public/album-<slug>.webp` (the `album-` prefix is used for every release kind).
3. **Prepend** a new entry to the `RELEASES` array (newest release goes at the top).
4. Optional fields: `kind` (`"Single" | "EP" | "Album"`) shows in the card meta line, and `streamingDate` (e.g. `"8.19"`) marks a release as not-yet-on-streaming.
5. Deploy — `pnpm --filter @workspace/artist-site run deploy`. Nothing is live until this runs.

**The MUSIC-section announcement block** is driven entirely by `streamingDate` on the newest release. Setting it renders the "new single / we're back on streaming" card above the release switcher plus an "on streaming <date>" stamp on the release card; clearing the field removes both. There is no separate announcement component to clean up.

### Deploying — READ THIS FIRST

**www.ashjo.com is a Cloudflare Worker named `ashjo`.** Not cPanel, not Replit, not static hosting — older notes in this repo said cPanel and they were wrong.

**Pushing to `main` does NOT deploy.** There is no GitHub Action, no `.cpanel.yml`, no build hook. GitHub and the live site are not connected in any way. The site changes only when someone runs the deploy command below. Never tell the user their change is live because it was merged.

When the user says "push it live" / "update the site" / "ship it", run exactly this:

```
pnpm --filter @workspace/artist-site run deploy
```

That builds `dist/static/` and runs `wrangler deploy` against `artifacts/artist-site/wrangler.jsonc`. It takes a couple of minutes — the asset upload is ~200 MB, mostly audio. Then confirm with `curl -sI https://www.ashjo.com/ | head -1` and by checking that a changed asset is actually served.

**It needs `CLOUDFLARE_API_TOKEN` in the environment.** Check with `npx wrangler whoami` before starting. If it says "not authenticated", stop and tell the user in your first sentence — do not build a bundle, do not suggest manual uploads, do not look for a workaround. `wrangler login` cannot work from an agent session; it needs an interactive browser. The fix is theirs: add `CLOUDFLARE_API_TOKEN` to the Claude Code environment settings, where it persists across sessions. The token needs the "Edit Cloudflare Workers" permission.

Useful extras:
- `npx wrangler deploy --dry-run` — validates config and bundles the Worker with **no** auth needed. Good for checking a change before the token exists.
- `npx wrangler secret put INSTAGRAM_ACCESS_TOKEN` — sets the one secret the Worker uses.
- `npx wrangler deployments list` / `npx wrangler rollback` — history and undo.

Do **not** commit build archives. `dist/` is gitignored and stays that way.

**Provenance note:** `worker/index.ts` and `wrangler.jsonc` were reconstructed on 2026-08-12 from the deployed Worker bundle, because the original source was never committed. Behaviour matches what was live, with two deliberate differences: the health check returns `{"status":"ok"}` directly instead of via a Zod parse, and `FALLBACK_VIDEOS[0]` now names White Truck. `not_found_handling: "single-page-application"` is set so `/lookbook` resolves; the previously deployed setting could not be read back, so **sanity-check `/lookbook` after the first deploy.**

## User preferences

- **Ship it — don't stage it.** "Do it" means the change is live on www.ashjo.com, not staged for review. Commit, fast-forward `main`, push, **then deploy** (see "Deploying"). No pull requests, no "ready for you to merge", no handing back a list of steps to run. If something genuinely blocks the deploy, say that in the first sentence — don't bury it after a summary of what was merged.
- **The user is not an engineer.** Don't explain internals unless asked, don't offer menus of options, and never end with homework. Pick the sensible path and do it.
- **No site-wide marquee/ticker banner.** Announcements belong inside the relevant section (e.g. the MUSIC section), styled like the rest of the page. The nav is pinned at `top-0`; don't reintroduce a bar above it.
- **Unreleased dates are written as future dates** ("out 8.19", "hits streaming 8.19"), never "out now", until the date actually passes.

## Gotchas

- **No image tooling is installed** in a fresh container — no `sharp`, `magick`/`convert`, `cwebp`, or `ffmpeg`. For cover conversion, `pip3 install --break-system-packages pillow` and resize with PIL; don't add `sharp` to the workspace for a one-shot conversion.
- **`vite.config.static.ts` sets `emptyOutDir: true`**, so `cp -r public/. dist/static/` must run *after* the build. The `build:static` script already orders this correctly — use it rather than running the two commands by hand.
- **Vite's `strictPort: true`** means the dev server fails outright if 19222 is already taken, rather than picking another port. Kill the stale process (`pkill -f vite`) instead of assuming the config is broken.
- **The workspace enforces a 1-day `minimumReleaseAge`** on new packages (`pnpm-workspace.yaml`). Installing a just-published version fails with a wall of text; pin a version a few days old instead of disabling the setting.
- **Never commit build archives.** `dist/` and `*.tar.gz` are both gitignored; deploying is `wrangler deploy`, not uploading files anywhere.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
