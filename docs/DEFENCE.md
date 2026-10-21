# Defence notes

Five minutes, then questions. This is the plan and the answers I want to have ready.

## 1. What the site is (45 s)

> "A personal site and study workspace: 15 pages, live at cxy0218-blog.pages.dev, built with
> Next.js and exported as static files. It has a blog, a photo wall, a weekly timetable, a study
> library, a time-tracking board, a Pomodoro timer and a desktop pet. Everything is in English:
> interface, articles, dates, metadata and screen-reader labels."

## 2. Demo path (2 min, in this order)

1. Home → open a post from the carousel. Point out: table of contents, reading time, code blocks.
2. Check-in page → start a block, show the calendar heat-map and the streak.
3. Toggle night mode; shrink the window to phone width and open the navigation drawer.
4. Photo wall → open the lightbox, close it with Escape.
5. Build log page → "this is the process evidence: what I decided and what I checked."

## 3. Three decisions to explain (1.5 min)

- **Static export, no server.** The brief needs no server-side code. The build writes plain
  HTML/CSS/JS, which is cheap and fast to host and means the submission package is the same code
  that runs online. Trade-off: the pet chat and the music lyrics need an API, so on Cloudflare they
  run as two small Pages Functions, and on GitHub Pages the interface degrades with a clear message
  instead of breaking.
- **localStorage instead of a database.** Check-in records, timetable edits, study links and photo
  albums live in the browser. That satisfies "no database required", but data belongs to one
  browser, so every one of those pages has export and import buttons, and the page says so.
- **Rebuilt navigation for English.** Chinese labels are short; the English ones are not. Twelve
  top-level items no longer fit, and the old circular drag-to-rotate phone menu could not be used
  with a keyboard. I grouped the pages into six sections with accessible dropdowns and replaced the
  circle with a standard drawer: focus moves into it, Tab stays inside, Escape closes it, focus
  returns to the trigger.

## 4. What I checked (45 s)

- Production build + static export pass; 23 pages and 66 internal assets return 200
  (`audit-links.mjs`).
- One `h1` per page, no skipped heading levels, every image has `alt`, every icon button has a
  name (`audit-a11y.mjs`).
- 390 px mobile pass: no horizontal overflow, no console errors (`audit-mobile.mjs`).
- Keyboard only: Tab through the header, open a dropdown with Enter, Escape to close; the drawer
  traps and restores focus.
- The AI use: I used AI tools for drafting and refactoring, then read every changed page, fixed the
  wording, ran the checks above and fixed what failed. The build log lists the mistakes the checks
  caught — leftover Chinese in labels, a skipped heading level, a broken static export path.

## 5. Questions I expect, and the shape of the answer

**"Why Next.js and not plain HTML?"**
Markdown articles, shared layout and component reuse. The build still produces static files; the
framework is a build-time tool, not a runtime dependency.

**"How does the bilingual-looking navigation work?"**
It is one array of sections in `components/Navbar.tsx`. Desktop renders buttons with
`aria-expanded` and a panel; mobile renders the same data as a drawer. Nothing is duplicated.

**"Where does the data live, and what happens if I clear the browser?"**
localStorage keys such as `xh-checkin-v1`; clearing the browser deletes it. That is why export and
import exist, and why the check-in page prints the warning.

**"Show me a bug you found and fixed."**
The static export first 404'd on every asset when hosted under a sub-path, because URLs were
hard-coded from `/`. I added `sitePath.ts` with `withBasePath`/`prefixHtml` and set
`NEXT_PUBLIC_BASE_PATH` for the GitHub Pages build only.

**"What would you do differently?"**
Start the writing earlier and commit smaller changes more often; also move the heavy 3D page behind
a lazy import so the first load of `/tree` is faster.

**"How did you make sure the English was right?"**
I translated from the Chinese originals with a glossary so names stayed consistent, read every
article after translating, kept command names, numbers and file paths unchanged, and retook the
screenshots from the English build so text and pictures match.
