# Development notes

## Environment

- The project ships with its own Node runtime; no system-wide Node install is required.
  (Portable Node v24.x lives in `node/`, which is git-ignored.)
- Dependencies are installed per app: `XHBlogs/` and `my-blog-manager/`.
  The local npm cache keeps every tarball, so reinstalling works offline.
- Node/Next telemetry is disabled via `NEXT_TELEMETRY_DISABLED=1` in the helper scripts.
  Without it, Next 16 can crash while writing its telemetry config on some machines.

## Running locally

| Script | What it does |
| --- | --- |
| `start-site.cmd` | development server (hot reload), listens on all interfaces, port 4322 |
| `start-site-production.cmd` | production build + `next start`; use this to judge real-world speed |
| `share-public-url.cmd` | temporary public URL over an SSH reverse tunnel (the address changes on every start) |
| `share-lan.cmd` | adds a Windows Firewall rule for port 4322 (run as administrator) |

The dev server binds `0.0.0.0`, so phones on the same Wi-Fi can open
`http://<this-pc-ip>:4322`. `127.0.0.1` only works on the machine itself.

## Environment variables

`XHBlogs/.env.local`:

```
DEEPSEEK_API_KEY=sk-...   # desktop pet chat backend (DeepSeek); optional
GEMINI_API_KEY=           # optional fallback backend
```

## Performance notes (what was changed and why)

- **Images** — every photo used by the site is downloaded, resized to 1600px and re-encoded as
  WebP into `public/photos` by `scripts/localize-images.mjs` (`npm run`-free, run with
  `node scripts/localize-images.mjs`). 20 images went from 13.9 MB to 2.9 MB. `SmartImage`
  still prefers the Next image optimizer when a server is available, but the static export
  (`unoptimized: true`) serves the pre-compressed files directly, so nothing depends on an
  external image host any more.
- **Background effects** — particle counts were reduced (150 → 40 grass blades, 50 → 18
  fireflies, 40 → 20 petals), animations use only `transform`/`opacity`, the danmaku uses
  transform instead of `right`, the click-ripple canvas only runs while ripples exist, and the
  full-screen `backdrop-blur` layer was removed.
- **Route transitions** — the page-enter animation is pure CSS and is skipped when navigating
  quickly, so animations never pile up. The 3D workshop modules load on demand.
- **Critical rendering path** — the previous build hid all page content until JavaScript and the
  splash animation finished, which showed as a long blank page on slow connections. Content is
  now visible immediately and the splash is only an overlay.
- **Fonts** — self-hosted, so builds do not need access to Google Fonts.

## Known limitations

- `next@16.2.1` reports known advisories; upgrade only after checking compatibility.
- Interactive data lives in browser local storage: it does not travel with the repository.
- `next build` must run with `--webpack` (the Turbopack build fails for this project).

## Static export and deployment

Both public deployments are pure static files. The export is produced by
`scripts/build-static.cmd`, which moves `XHBlogs/app/api` to `app/_api_disabled` for the duration
of the build (route handlers cannot be exported) and moves it back afterwards — also when the
build fails.

```bash
scripts\build-static.cmd                                  # → XHBlogs/out, no basePath
set NEXT_PUBLIC_BASE_PATH=/Cxy0218-blog & scripts\build-static.cmd   # GitHub Pages build
```

Because a static export cannot run `next/image` or route handlers:

- the pet chat and the music proxy live in `XHBlogs/functions/api/*.ts` (Cloudflare Pages
  Functions, edge runtime) — see `scripts/deploy-cloudflare.mjs`;
- server-side image optimisation is off, hence the pre-compressed `public/photos` files;
- `XHBlogs/sitePath.ts` adds the deployment prefix to every non-`next/image` asset reference,
  which is what makes the GitHub Pages sub-path deployment work.
