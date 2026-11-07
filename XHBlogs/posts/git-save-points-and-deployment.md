---
title: "Save points for a folder: Git, GitHub and going live"
date: "2026-11-05 18:40:00"
tags: ["Git", "GitHub", "Deployment"]
mood: "Relieved"
cover: "/photos/own/course-git.webp"
description: "Git as save points, the daily three commands, .gitignore, and the deployment detour that turned into a domain and DNS lesson."
---

The Git lesson started with a folder full of files called `about-final-REALLY.html`, which is exactly how I used to work. The lesson's framing was better than any Git tutorial I had read: **a commit is a save point for a folder.** If the next change goes wrong, load the save. Unlike a game, Git keeps every save.

## Git is not GitHub

This distinction took me a while, so I wrote it down:

- **Git** — a program on my computer, records the history of one folder, works offline.
- **GitHub** — a website that keeps a copy of that history online, needs the internet.

I can use Git without GitHub. I cannot use GitHub without Git.

## Three words do most of the work

| Command | What it does |
| --- | --- |
| `git add .` | choose which changes go into the next commit |
| `git commit -m "message"` | record a snapshot with a message |
| `git push` | send the commits to GitHub |

`add` and `commit` work without internet. Only `push` and `pull` need it. And the message matters: `update` says nothing, `Fix the broken image path on about.html` says exactly what changed. The commit list is also part of the course's process grade — it shows the work growing week by week, and it cannot be written the night before.

## What never goes in

A `.gitignore` file keeps junk and secrets out:

```
.DS_Store
Thumbs.db
node_modules/
.env
```

Passwords and API keys must never be committed. If one slips in, deleting the file is not enough — it is still in the history, so the key has to be changed.

## Committing before the AI touches anything

The most useful habit from the lesson: commit before every AI prompt. If the AI rewrites the page and makes it worse, I am one click away from the previous version. This is the practical version of "save before the boss fight".

I also started reading the errors instead of pasting them straight into a search. `fatal: not a git repository` means I am in the wrong folder. `Author identity unknown` means the two `git config` lines were never run. `rejected … (fetch first)` means GitHub has a commit I do not — pull, then push. The messages are usually plain English.

## Deployment: the part after the code

The course expects both projects to be live at a real address. The shortest route is GitHub Pages: repository → Settings → Pages → deploy from branch → `main`.

My personal project ended up on Cloudflare Pages with a GitHub Pages mirror, but the same ideas applied: the repository is public, every push updates the hosted copy, and the address must open on campus Wi-Fi and on mobile data.

The detour was DNS. Pointing a domain at a host means adding records — an `A` record for the root, a `CNAME` for `www` — and then waiting. The screenshots on my [photo wall](/photowall) include the DNS page from that afternoon, because it took longer than the HTML did. The lesson's checklist had it right: `git --version` answers, Git knows your name and email, the repository is on GitHub, and the live link opens.

Full lesson: [webtech.landrock.io/slides/git-github.html](https://webtech.landrock.io/slides/git-github.html).
