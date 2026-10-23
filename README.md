# Chen Xiangyang (cxy0218) — Personal Site & Study Workspace

My web-course final project and the site I actually use every day: a blog, a photo wall, a weekly
timetable, a study-link library, a time-tracking board, a Pomodoro timer and a small desktop pet.
It is written in English throughout — interface, articles, metadata and accessibility labels.

- **Live site:** <https://cxy0218-blog.pages.dev/>
- **How it was built, week by week:** the `/build-log` page (source: `XHBlogs/app/build-log/page.tsx`)
- **Code:** <https://github.com/Chen070218/Cxy0218-blog>

## What the course brief asks for

| Requirement | Where it is answered |
| --- | --- |
| At least four pages with working navigation | 15 routes, grouped into six sections; every internal link is checked by `scripts/audit-links.mjs` |
| Own content | Six long articles, three moments and a design note, all written from my own coursework and debugging |
| Semantic, accessible markup | Landmarks, one `h1` per page, labelled controls, keyboard-operable menus, visible focus, reduced-motion support |
| Responsive layout | Phone, tablet and desktop layouts; checked at 390 px and 1280 px with `scripts/audit-mobile.mjs` |
| At least one interactive element | Clock, Pomodoro timer, check-in tracker, editable timetable, search and filters, photo lightbox, desktop pet |
| Live at a real address | Cloudflare Pages, with a GitHub Pages mirror |
| Git history | The development history is on `main`; see `/build-log` for the commit-by-commit story |
| No server-side programming or database required | Static export; all user data stays in browser local storage |

## Pages

`/` home · `/posts` + `/posts/[slug]` articles · `/chatter` + `/chatter/[slug]` musings ·
`/timeline` archive · `/local-posts` browser drafts · `/courses` timetable · `/resources` study
links · `/photowall` photo albums · `/moments` short posts · `/music` player · `/checkin` time
tracking · `/tree` creative workshop · `/about` about me · `/build-log` process page · `/friends`
friend links.

## Features

- **Blog** — Markdown posts with GFM, KaTeX maths and syntax highlighting, an index page, per-post
  pages, reading time and a table of contents.
- **Moments and musings** — short "moments" with image lightbox, plus longer informal notes.
- **Photo wall** — albums with a zoomable lightbox; photos are committed as WebP (max 1600 px,
  roughly 100 KB each) by `scripts/localize-images.mjs`, so nothing depends on an external image host.
- **Course planner** — a weekly timetable seeded from this semester; lessons can be edited in the
  browser.
- **Study library** — curated links that ship with the repository, plus locally added entries and files.
- **Time tracking** — categories, a start/stop timer, notes, ratings, a month heat-map, streaks and
  JSON export/import.
- **Pomodoro timer** — 25/5 focus cycles in the toolbox; the desktop pet announces each phase change.
- **Desktop pet** — a Q-version fox spirit (Xinyuehu) with nine states, a daily greeting, a
  stand-up reminder and a chat bubble powered by DeepSeek through `/api/chat`.
- **Extras** — light/dark theme, music player, danmaku background, calculator, custom 404 page.

## Tech stack

- Next.js 16.2.1 (App Router), React 19, Tailwind CSS 4, framer-motion, lucide-react
- three.js / @react-three/fiber for the creative-workshop page, Tiptap for rich-text editing
- Markdown pipeline: gray-matter, remark/rehype, KaTeX, highlight.js
- Fonts are self-hosted (Geist variable fonts), so no runtime dependency on Google Fonts

## Project layout

```
XHBlogs/           the public website (Next.js)
docs/              working notes (translation glossary, editing notes)
my-blog-manager/   local content console (Python + Next.js), not part of the submitted site
picture/           source images
scripts/           helper scripts (build, deploy, audits, packaging)
```

## Getting started

```bash
cd XHBlogs
npm ci
npm run dev            # http://localhost:3000, or use start-site.cmd
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

On Windows the helper scripts `start-site.cmd` (development), `start-site-production.cmd`
(production preview) and `share-public-url.cmd` (temporary public URL through an SSH tunnel) start
the site.

## Checks

```bash
node scripts/audit-a11y.mjs XHBlogs/out              # html lang, one h1 per page, heading order, alt text, names
node scripts/audit-links.mjs http://127.0.0.1:4500/  # walks every page and every internal asset
node scripts/audit-mobile.mjs http://127.0.0.1:4500/ # 390×844 viewport: overflow and console errors
```

The same checks (plus a production build) run in CI on every push: `.github/workflows/ci.yml`.

## Deployment

The site runs as a **fully static export** and is published in two places:

| Target | URL | How it is built |
| --- | --- | --- |
| **Cloudflare Pages** (primary, full features) | `https://cxy0218-blog.pages.dev` | `scripts/deploy-cf.cmd` (static export + `wrangler pages deploy`) |
| GitHub Pages (static mirror) | `https://chen070218.github.io/Cxy0218-blog/` | `.github/workflows/pages.yml` on every push to `main` |

Cloudflare is the primary address because it can run the Pages Functions below, so the pet chat
and the music player work there. GitHub Pages only serves static files.

A static export has no Node server, so the route handlers under `app/api` are moved aside during
the build (`scripts/build-static.cmd` does this automatically and restores them afterwards) and
re-implemented as **Cloudflare Pages Functions** in `XHBlogs/functions/api`:

- `functions/api/chat.ts` — the desktop pet's DeepSeek chat, a plain JSON response; the key is read
  from the `DEEPSEEK_API_KEY` environment variable only.
- `functions/api/music.ts` — proxies the NetEase Cloud Music detail and lyric endpoints.

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

Setting a secret needs one extra deployment because Pages injects environment variables at deploy
time:

```bash
scripts\cf.cmd pages secret put DEEPSEEK_API_KEY --project-name=cxy0218-blog
scripts\deploy-cf.cmd
```

### Local package for submission

```bash
node scripts/make-local-package.mjs --no-key   # dist/cxy0218-local.zip, no API key included
```

The zip contains a portable Node runtime, the built site and `start-site.cmd`; unzip it and
double-click the launcher, no installation and no network needed for the site itself.

## Content and data

- Articles, moments and musings are Markdown files inside `XHBlogs/posts`, `XHBlogs/moments` and
  `XHBlogs/chatters`.
- Anything added through the interface (course entries, study resources, photo albums, check-in
  records, visual settings) is stored in the browser's local storage. Use the export/import
  buttons on those pages to move data between devices.
- The site was rewritten from Chinese to English in October 2026; the glossary used for that
  rewrite is in `docs/TRANSLATION-GUIDE.md`, and the decisions behind the site are on the
  `/build-log` page.

## License

See [LICENSE](./LICENSE). Character art and game screenshots belong to their original artists and
publishers; this is a personal study project with no commercial use.
