---
title: "Another computer, same blog: moving the site from C: to D:"
cover: "/screenshots/05-posts.webp"
date: "2026-10-14 21:30:00"
tags: ["Next.js", "Environment", "Troubleshooting"]
mood: ''
description: "How I got it running on a machine without Node — and the three places it got stuck."
---

I started writing this site on another computer. The C: drive was nearly full, so I moved the whole thing to the D: drive on this machine. After the move it wouldn't start — that machine had never had Node installed.

## No Node, so don't install Node

The first line of the startup script is `where node`; if that fails, the script just exits. I was going to install Node, then thought about the lab machines and other people's computers, which probably don't have it either, so I downloaded the official portable version (the win-x64 zip), unzipped it into the project directory, and made the script prefer it:

```bat
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"
```

That way it doesn't need admin rights, and switching machines just means copying the whole folder over; when you're done you delete the directory. The offline package I later gave my lecturer was built the same way.

## The dependency install broke off halfway

`npm ci` has to download several hundred packages, and one network hiccup in the middle (it reported `ECONNRESET`) meant starting over from scratch. So I put the cache directory inside the project too:

```bat
npm ci --cache .\npm-cache
```

If it breaks off, re-running it hits the packages already downloaded; no need to delete `node_modules`, npm handles that itself.

## It started, then quit by itself

This was the strangest one: the terminal clearly printed `Ready`, and then a moment later the process was gone. Digging through the error, it was `EXDEV: cross-device link not permitted`, coming from the step where Next writes its telemetry config. Adding this one line fixed it:

```bat
set "NEXT_TELEMETRY_DISABLED=1"
```

## A few things I fixed along the way

Once the environment was running, I went back to a few problems that were obvious at a glance: the whole page's content was hidden by CSS waiting for JS (a blank screen on a phone), which I changed to show the content directly; images used to be served at full size, and converting them to WebP cut them down a lot; the page transition animation used to change things frame by frame in JS and would pile up if you clicked quickly, so I moved it to CSS.

![The posts list after the cleanup](/screenshots/05-posts.webp)

The biggest takeaway from the move wasn't any of the fixes: it was realizing that a single assumption in the startup script — "the machine has Node" — can block someone for half a day. Since then, anything that depends on the outside environment I try to catch in the script first.
