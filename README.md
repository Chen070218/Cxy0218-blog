# cxy0218 — Personal Blog & Study Workspace

A personal website built with **Next.js 16 (App Router)** plus a local management console.
It combines a blog, a photo wall, a weekly course planner, a study-resource library,
a time-tracking board, a Pomodoro timer and a small AI desktop pet.

## Features

- **Blog** — Markdown posts with GFM, KaTeX math and syntax highlighting; an index page at `/posts` and per-post pages.
- **Moments & chatters** — short "moments" with an image lightbox, plus longer informal posts.
- **Photo wall** — albums with a zoomable lightbox; photos are stored in the repository as WebP files (max 1600px, roughly 100 KB each) produced by `scripts/localize-images.mjs`, so the wall no longer depends on an external image host.
- **Course planner** — a weekly timetable seeded from the current semester; lessons can be edited in the browser.
- **Study library** — curated study links that ship with the repository, plus your own local entries.
- **Time tracking** — categories, a start/stop timer, notes, star ratings, per-day records, a month heat-map, streaks, and JSON export/import backup.
- **Pomodoro timer** — 25/5 focus cycles inside the toolbox; the desktop pet announces each phase change.
- **Desktop pet** — a Q-version fox-spirit sprite with nine states (idle, walk, happy, angry, sleep, curious, lying down, thinking, interacting), a daily greeting, a sedentary reminder, and a chat bubble powered by DeepSeek through `/api/chat`.
- **Extras** — light/dark theme, music player, danmaku background, calculator toolbox, custom 404 page.

## Tech stack

- Next.js 16.2.1 (App Router), React 19, Tailwind CSS 4, framer-motion, lucide-react
- three.js / @react-three/fiber for the creative-workshop page, Tiptap for rich-text editing
- Markdown pipeline: gray-matter, remark/rehype, KaTeX, highlight.js
- Fonts are self-hosted (Geist + Noto Serif SC variable), so no runtime dependency on Google Fonts

## Project layout

```
XHBlogs/           the public website (Next.js)
my-blog-manager/   local management console (Python + Next.js)
picture/           source images
scripts/           helper scripts
```

## Getting started

```bash
cd XHBlogs
npm ci
npm run dev            # http://localhost:4322 when started through the helper script
```

Production build and preview:

```bash
cd XHBlogs
npx next build --webpack    # webpack is required; the Turbopack build fails for this project
npm start
```

Environment variables (`XHBlogs/.env.local`, see `.env.local.example`):

```
DEEPSEEK_API_KEY=sk-...     # powers the desktop pet chat; optional
```

On Windows the helper scripts `启动网站.cmd` (development), `启动网站(生产模式).cmd` (production
preview) and `开启外网访问.cmd` (temporary public URL through an SSH tunnel) start the site.

## Deployment

The site runs as a **fully static export** and is published in two places:

| Target | URL | How it is built |
| --- | --- | --- |
| **Cloudflare Pages** (primary, full features) | `https://cxy0218-blog.pages.dev` | `scripts/deploy-cf.cmd` (static export + `wrangler pages deploy`) |
| GitHub Pages (static mirror) | `https://chen070218.github.io/Cxy0218-blog/` | `.github/workflows/pages.yml` on every push to `main` |

Cloudflare is the primary address because it can run the Pages Functions described below, so the
pet chat and the music player work there. GitHub Pages only serves static files.

A static export has no Node server, so the route handlers under `app/api` are moved aside during
the build (`scripts/build-static.cmd` does this automatically and restores them afterwards) and
re-implemented as **Cloudflare Pages Functions** in `XHBlogs/functions/api`:

- `functions/api/chat.ts` — the desktop pet's DeepSeek chat, streaming-free JSON, key read from the
  `DEEPSEEK_API_KEY` environment variable only.
- `functions/api/music.ts` — proxies the NetEase Cloud Music detail/lyric endpoints.

GitHub Pages (a project site) is served from a sub-path, so every hard-coded asset URL is prefixed
through `XHBlogs/sitePath.ts` (`withBasePath` for plain `<img>`/CSS/Markdown, `prefixHtml` for
rendered Markdown). The GitHub Pages build sets `NEXT_PUBLIC_BASE_PATH=/Cxy0218-blog`; the
Cloudflare build leaves it empty.

### Redeploying

```bash
# Cloudflare — one-time browser login, then build + upload
scripts\cf.cmd login --browser=false     # open the printed link once and click "Allow"
scripts\deploy-cf.cmd

# Or just push to main — GitHub Pages rebuilds itself
git push origin main
```

`scripts/deploy-cloudflare.mjs` is the token-based alternative (for CI or a machine without a
browser): it reads `CLOUDFLARE_API_TOKEN` (or `.cf-token`), creates the project, writes
`DEEPSEEK_API_KEY` and deploys.

Setting a secret needs one extra deployment because Pages injects environment variables at
deploy time:

```bash
scripts\cf.cmd pages secret put DEEPSEEK_API_KEY --project-name=cxy0218-blog
scripts\deploy-cf.cmd
```

### Checking the deployed site

```bash
node scripts/audit-links.mjs https://chen070218.github.io/Cxy0218-blog/ 40
```

The checker walks every page, follows internal links and reports any page, image, stylesheet or
script that does not return `200`.

## Content and data

- Articles, moments and chatters are Markdown files inside `XHBlogs/posts`, `XHBlogs/moments`
  and `XHBlogs/chatters`.
- Anything added through the interface (course entries, study resources, photo albums,
  check-in records, visual settings) is stored in the browser's local storage. Use the
  export/import buttons on those pages to move data between devices.

## License

See [LICENSE](./LICENSE).
