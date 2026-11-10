# Live Server backup for the presentation

The teacher asked for Live Server as a backup. It is installed in VS Code.

## What is installed

- VS Code extension: `ritwickdey.LiveServer` v5.7.10
- A workspace setting in `XHBlogs/.vscode/settings.json`:
  - serves the static export folder `XHBlogs/out` as the site root
  - port `5500`

## Start it

1. Open **`D:\XinghuiBlog\XHBlogs`** in VS Code (open the `XHBlogs` folder, not the parent).
2. Open the Command Palette: `Ctrl + Shift + P`.
3. Run **“Live Server: Open with Live Server”**.
4. It should open `http://127.0.0.1:5500/`.

If the extension opens the wrong folder, right-click `out/index.html` in the Explorer and choose **“Open with Live Server”**. That always serves `out` directly.

## Before presenting

The `out` folder must match the current source. Rebuild it once:

```cmd
cd /d D:\XinghuiBlog
scripts\build-static.cmd
```

Then start Live Server. A quick check: the home page should show the clock and the dark desk theme, and the navigation should not contain Hobbies, Timeline or Build Log.

## Fallbacks, in order

1. **Cloudflare Pages (primary):** <https://cxy0218-blog.pages.dev/>
2. **GitHub Pages mirror:** <https://chen070218.github.io/Cxy0218-blog/>
3. **Live Server:** `http://127.0.0.1:5500/`
4. **Local package:** `D:\XinghuiBlog\dist\cxy0218-local-no-key\start-site.cmd`

The local package uses a portable Node server and does not need VS Code, so keep it on the Desktop as the last resort.

## Why this works with a Next.js site

The site is a **static export**: `next build` writes plain HTML, CSS and JavaScript to `XHBlogs/out`. There is no Node server in production, so any static file server — including Live Server — can serve it. That is also why the teacher's Live Server backup is valid.
