# Code walkthrough — how the site fits together, and where faults hide

This is the map I use when something breaks: which layer owns the problem, in which file, and
what evidence to look for. It doubles as preparation for the written examination (reading and
diagnosing unfamiliar code).

## Layers at a glance

| Layer | Runs where | Files | Symptoms when it is wrong |
| --- | --- | --- | --- |
| Content | build time | `XHBlogs/posts/`, `XHBlogs/chatters/`, `XHBlogs/moments/` | a page missing, wrong title/date, a post not in the index |
| Rendering | build time (server components) | `XHBlogs/app/**/page.tsx` | wrong HTML in `out/`, a route absent from the build output |
| Client state | browser | components with `"use client"`, `localStorage` | page loads but controls do nothing, data disappears after refresh |
| Assets / paths | build + host | `XHBlogs/public/`, `XHBlogs/sitePath.ts`, `next.config.ts` | 404s, broken images, broken CSS under a sub-path |
| Hosting / config | Cloudflare Pages / GitHub Pages | `functions/api/`, `.github/workflows/`, `scripts/` | an API 404 or 500, deploy succeeds but the site is stale |

If a fault changes what the HTML contains, it is a build/render problem. If the HTML is right but
the page still misbehaves, it is client state. If the HTML is right and the browser asked for URLs
that 404, it is paths/hosting. Check those in that order.

## A page, from file to screen

1. `app/posts/page.tsx` is a **server component**. At build time it reads `XHBlogs/posts/*.md` with
   `fs.readdirSync`, parses frontmatter with `gray-matter`, computes reading time from the word
   count, sorts by date descending, and renders cards.
2. `app/posts/[slug]/page.tsx` does the heavier version: `generateStaticParams()` lists every
   Markdown file; `getPostData()` turns the body into HTML with `remark` → `rehype` (plus KaTeX and
   syntax highlighting); `generateMetadata()` gives each article its own `<title>`.
3. The exported `out/posts/ai-desktop-pet/index.html` already contains the article text. The
   browser downloads JS for interactive parts only (search, theme, the pet, menus) — that is why the
   page still reads with JavaScript disabled.
4. `components/SmartImage.tsx` wraps images. A static export has no server-side image optimiser
   (`images.unoptimized` in `next.config.ts`), so files in `public/` are used as they are. That is
   why images are pre-compressed to WebP by `scripts/localize-images.mjs`.

## Where state lives

| Page | Storage key | Shape |
| --- | --- | --- |
| Check-in | `xh-checkin-v1` | `{ categories, records }` |
| Courses | `shore-courses-v1` (see `app/courses/CourseCalendar.tsx`) | array of lessons |
| Study library | keys in `app/resources/ResourceLibrary.tsx` | resources + local files |
| Photo albums | keys in `app/photowall/PhotoWallClient.tsx` | albums |
| Theme | `next-themes` | `"light"` / `"dark"` |

All of them are wrapped in `try/catch` because a user can edit or clear storage at any time. When
"my data disappeared", the first question is which key, on which origin, in which browser profile.

## Navigation and routing

- Routes are filesystem paths: `app/tree/page.tsx` → `/tree`, `app/posts/[slug]/page.tsx` →
  `/posts/<slug>`. A new page needs no route table.
- `components/Navbar.tsx` defines the whole navigation as a `NAV_ITEMS` array (six sections, each
  with children). Desktop renders `button` + panel with `aria-expanded`/`aria-controls`; mobile
  renders the same data as a dialog drawer with focus trapping. Adding a page means adding one entry
  to that array.
- `sitePath.ts` exists because GitHub Pages serves the site from `/Cxy0218-blog/`, not `/`.
  `withBasePath()` prefixes plain URLs; `prefixHtml()` rewrites the HTML produced from Markdown.
  The Cloudflare build sets no base path. A broken URL on one host but not the other points here.

## Build and deploy

- `npx next build --webpack` → `.next/` (normal server build, used by the local package and by
  `npm start`).
- `scripts/build-static.cmd` sets `STATIC_EXPORT=1`, moves `app/api` aside (a static export cannot
  contain route handlers), builds to `out/`, then restores `app/api`. If the build is interrupted,
  the script refuses to run again until `app/_api_disabled` is put back — that guard exists because
  an interrupted build once left the API folder moved.
- `out/` plus `functions/api/` is what `wrangler pages deploy` uploads to Cloudflare. The functions
  re-implement the two API endpoints the static site cannot run: pet chat and music lyrics.
- `scripts/audit-links.mjs`, `audit-a11y.mjs` and `audit-mobile.mjs` are the acceptance checks.
  They run against `out/` or a URL, which is why they can check the deployed site and not just the
  source.

## Five faults and how to hunt them

**1. A new post does not appear.**
Look at: `posts/<slug>.md` exists, frontmatter has `title` and `date`, `generateStaticParams()`
listed it in the build log, and the index page sorted it. Evidence: the build output lists the
route (`● /posts/<slug>`), or the page exists but the card is missing → the index's file read or the
sort is the problem, not the article.

**2. Everything 404s under a sub-path, but works at the root.**
The host is serving from a sub-directory and an asset URL starts with `/`. The owner is
`sitePath.ts` usage, not the component that shows the image. Evidence: the network panel shows
`/photos/x.webp` returning 404 while the page itself loaded from `/repo/photowall/`.

**3. "Hydration failed" / content flashes and disappears.**
A server render and the first client render disagree: a date, a random value, or `localStorage` read
during render. The fix is to render the same thing on both sides and move the browser-only value
into `useEffect` (as `ThemeProvider` does with its mounted flag).

**4. The check-in page is empty after a deploy, but was full locally.**
Data is in `localStorage` on one origin. Different origin (`localhost` vs the deployed domain) means
different storage. That is a state/expectation problem, not a code bug — the export/import feature
exists for exactly this.

**5. The music card says "no music available".**
Static hosting has no `/api/music`, or the upstream NetEase endpoint is rate-limiting. Evidence:
the network panel shows 404/500 for `/api/music?ids=...`. The component must degrade with a clear
message instead of spinning forever; the player is not the fault.

## Reading unfamiliar code: a routine

1. Start at the route file (`app/<path>/page.tsx`) and read only what it imports.
2. Decide: server component (no `"use client"`) or client component. That tells you where it runs.
3. Find the data source: `fs` + `gray-matter` (build time), `fetch` (runtime), or storage (browser).
4. Find what is rendered: the exported HTML is the ground truth — open `out/<route>/index.html`.
5. Only then read the component tree. Most "wrong layer" mistakes come from editing the view when
   the data or the URL was wrong.
