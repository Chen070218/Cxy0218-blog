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
| `启动网站.cmd` | development server (hot reload), listens on all interfaces, port 4322 |
| `启动网站(生产模式).cmd` | production build + `next start`; use this to judge real-world speed |
| `开启外网访问.cmd` | temporary public URL over an SSH reverse tunnel (address changes每次启动) |
| `开启手机访问.cmd` | adds a Windows Firewall rule for port 4322 (run as administrator) |

The dev server binds `0.0.0.0`, so phones on the same Wi-Fi can open
`http://<this-pc-ip>:4322`. `127.0.0.1` only works on the machine itself.

## Environment variables

`XHBlogs/.env.local`:

```
DEEPSEEK_API_KEY=sk-...   # desktop pet chat backend (DeepSeek); optional
GEMINI_API_KEY=           # optional fallback backend
```

## Performance notes (what was changed and why)

- **Images** — the image host does not support resize parameters, so the built-in Next image
  optimizer is enabled and `SmartImage` routes whitelisted hosts through it (other hosts fall
  back to a plain `<img>`). A 900 KB photo is delivered as a 50–80 KB WebP.
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