# ashjo

The website **www.ashjo.com** — Ash Johansen's artist site.

> **Read [Deploying](#deploying--read-this-first) before shipping anything.**
> The site is a Cloudflare Worker, and there is more than one way to get it wrong.

## The whole repo, in two parts

| Folder | What it is |
|---|---|
| `artifacts/artist-site/` | The website itself — React + Vite. Nearly all of it is `src/pages/Home.tsx`; custom CSS is `src/index.css`. |
| `artifacts/website-worker/` | The Cloudflare Worker that serves it. Handles three JSON routes, hands everything else to the built site. |

`attached_assets/` holds source images, audio masters and pasted notes. Some are historical and referenced by nothing.

That's it. There is no database, no backend service, no CMS, and no test suite.

## Run & Operate

```
pnpm install                                        # once
pnpm --filter @workspace/artist-site run dev        # the site, on :19222
pnpm run typecheck                                  # both packages
pnpm run build                                      # typecheck + build
pnpm run deploy:website                             # build + deploy (see Deploying)
```

`PORT` and `BASE_PATH` override the dev server's defaults but are not required.

**Environment variables**

| Name | Used by | Required? |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `wrangler deploy` | Only for deploying straight from a session. Pushing to `main` deploys without it. |
| `INSTAGRAM_ACCESS_TOKEN` | Worker `/api/instagram-feed` | No — a Worker *secret*, not a repo value. Missing means an empty post list. |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 18 + Vite 7 + Tailwind v4, routed with `wouter`
- Cloudflare Workers in production (static assets + three JSON endpoints)

## Architecture decisions

- **One Worker serves everything.** `website-worker/src/index.ts` answers `/api/healthz`, `/api/youtube-feed` and `/api/instagram-feed`, and falls through to the `ASSETS` binding for the rest, stamping security headers on the way out. `run_worker_first: true` in `wrangler.jsonc` is what lets it see the API paths at all.
- **The Worker reads the site's build output.** `wrangler.jsonc` points `assets.directory` at `../artist-site/dist/static`, so the site must be built before the Worker is deployed. `deploy:website` does both in order.
- **The video feed goes through the Worker**, not a third-party CORS proxy. If it fails, `FALLBACK_VIDEO_IDS` in `Home.tsx` is the backstop — keep it in sync with `FALLBACK_VIDEOS` in the Worker.
- **Music is self-hosted**, not embedded from a streaming service. See below.

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
5. Ship it — see [Deploying](#deploying--read-this-first). Nothing is live until that happens.

**The MUSIC-section announcement block** is driven entirely by `streamingDate` on the newest release. Setting it renders the "new single / we're back on streaming" card above the release switcher plus an "on streaming <date>" stamp on the release card; clearing the field removes both. There is no separate announcement component to clean up.

### Deploying — READ THIS FIRST

**www.ashjo.com is a Cloudflare Worker named `ashjo`** (`artifacts/website-worker/`). Not cPanel — older notes in this repo said cPanel and they were wrong.

**Cloudflare Workers Builds is connected to this GitHub repo.** Pushing to the production branch triggers a build that deploys the site. Nothing in the repo shows this — the config lives in the Cloudflare dashboard under Workers & Pages → ashjo → Settings → Build — so do not conclude "there is no CI" just because there is no `.github/workflows`.

That means there are two ways to ship, and you should normally use the first:

1. **Push to `main`.** That is the production branch, and it deploys on its own. The build takes 1–3 minutes, so do not judge it by checking immediately — verify by watching the Worker's `modified_on` move (Cloudflare MCP `workers_list`). If that timestamp does not change, the build failed and **the site did not change.**

2. **Deploy directly** with `pnpm run deploy:website`, which builds the static bundle and runs `wrangler deploy`. This needs `CLOUDFLARE_API_TOKEN` in the environment. Without it wrangler stops with a clear error and there is no workaround from inside the container — `wrangler login` needs an interactive browser. Say so immediately instead of hunting for one.

**The build settings live in the Cloudflare dashboard** (Workers & Pages → ashjo → Settings → Build), not in this repo:

| Setting | Value |
|---|---|
| Root directory | `artifacts/website-worker` |
| Build command | `pnpm --filter @workspace/artist-site exec vite build --config vite.config.static.ts` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |
| Build non-production branches | **off** — only `main` can deploy |

Only `main` builds. Feature branches are safe to push — they will not touch the live site. Keep it that way: the deploy command is an unconditional `npx wrangler deploy`, so if non-production branch builds are ever switched back on, *any* branch push would publish straight to production.

**Never tell the user a change is live just because it was merged or pushed.** Verify: `curl -sI https://www.ashjo.com/ | head -1`, and check that a changed asset is really being served.

Useful extras:
- `pnpm --filter @workspace/website-worker exec wrangler deploy --dry-run` — validates config and bundles the Worker with **no** auth needed.
- `wrangler secret put INSTAGRAM_ACCESS_TOKEN --name ashjo` — the one secret the Worker uses. Without it the Instagram feed returns an empty list, which is fine.
- `wrangler deployments list` / `wrangler rollback` — history and undo.

Do **not** commit build archives. `dist/` and `*.tar.gz` are gitignored.

## User preferences

- **Ship it — don't stage it.** "Do it" means the change is live on www.ashjo.com, not staged for review. Commit, fast-forward `main`, push, **then deploy** (see "Deploying"). No pull requests, no "ready for you to merge", no handing back a list of steps to run. If something genuinely blocks the deploy, say that in the first sentence — don't bury it after a summary of what was merged.
- **The user is not an engineer.** Don't explain internals unless asked, don't offer menus of options, and never end with homework. Pick the sensible path and do it.
- **No site-wide marquee/ticker banner.** Announcements belong inside the relevant section (e.g. the MUSIC section), styled like the rest of the page. The nav is pinned at `top-0`; don't reintroduce a bar above it.
- **Unreleased dates are written as future dates** ("out 8.19", "hits streaming 8.19"), never "out now", until the date actually passes.

## Gotchas

- **Check `git branch -r` before assuming `main` is the truth.** In Aug 2026 the entire Cloudflare migration sat on an unmerged branch for 18 days while `main` still described cPanel hosting. Every session read `main`, believed it, and was wrong. If the repo contradicts the Cloudflare dashboard, the dashboard wins.
- **Vite copies `public/` into the build automatically.** No `cp` step is needed — `vite build --config vite.config.static.ts` alone produces the full `dist/static/`.
- **No image tooling is installed** in a fresh container — no `sharp`, `magick`/`convert`, `cwebp`, or `ffmpeg`. For cover conversion, `pip3 install --break-system-packages pillow` and resize with PIL; don't add `sharp` for a one-shot conversion.
- **Vite's `strictPort: true`** means the dev server fails outright if 19222 is already taken rather than picking another port. Kill the stale process (`pkill -f vite`) instead of assuming the config is broken.
- **The workspace enforces a 1-day `minimumReleaseAge`** (`pnpm-workspace.yaml`). Installing a just-published package fails with a wall of text; pin a slightly older version instead of disabling the setting.
- **Never commit build archives.** `dist/` and `*.tar.gz` are gitignored.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
