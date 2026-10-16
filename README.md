# cxy0218 — Personal Blog & Study Workspace

A personal website built with **Next.js 16 (App Router)** plus a local management console.
It combines a blog, a photo wall, a weekly course planner, a study-resource library,
a time-tracking board, a Pomodoro timer and a small AI desktop pet.

## Features

- **Blog** — Markdown posts with GFM, KaTeX math and syntax highlighting; an index page at `/posts` and per-post pages.
- **Moments & chatters** — short "moments" with an image lightbox, plus longer informal posts.
- **Photo wall** — albums with a zoomable lightbox; images are served as on-demand WebP through the Next image optimizer.
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

The site is deployed on **Vercel**. When importing this repository set **Root Directory** to
`XHBlogs` and add `DEEPSEEK_API_KEY` under the project's environment variables. `vercel.json`
already pins the build command to `next build --webpack`.

## Content and data

- Articles, moments and chatters are Markdown files inside `XHBlogs/posts`, `XHBlogs/moments`
  and `XHBlogs/chatters`.
- Anything added through the interface (course entries, study resources, photo albums,
  check-in records, visual settings) is stored in the browser's local storage. Use the
  export/import buttons on those pages to move data between devices.

## License

See [LICENSE](./LICENSE).