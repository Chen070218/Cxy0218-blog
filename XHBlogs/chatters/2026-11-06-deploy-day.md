---
title: "Deploy day: the DNS took longer than the HTML"
date: '2026-11-06 18:20:00'
tags:
- Git
- Deployment
mood: Tired
cover: /photos/own/course-git.webp
description: The code was ready in an afternoon. The address was not.
---

The Git lesson made deployment sound like three clicks: repository, Settings, Pages, branch `main`. The code part really was that quick. The address was not.

Pointing a domain at a host meant an `A` record for the root and a `CNAME` for `www`, then waiting for cached DNS to notice. I refreshed the page too often, changed one record twice, and learned that "it works on my machine" has a second version: "it works in my browser cache".

The useful part is the checklist. `git --version` answers, Git knows my name and email, the repository is public and pushed, and the live link opens on campus Wi-Fi and on mobile data. Everything else is waiting.
