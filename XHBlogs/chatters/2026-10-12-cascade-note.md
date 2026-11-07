---
title: "The cascade is not a list of commands"
date: '2026-10-12 21:10:00'
tags:
- CSS
- Debugging
mood: Curious
cover: /photos/own/course-boxmodel.webp
description: Specificity finally explained why one of my rules kept losing.
---

I used to think CSS was a list of instructions executed from top to bottom. If a rule did not apply, I added a more specific selector until it did — without knowing what "more specific" was measured in.

The lesson gave it a number: element `0,0,0,1`, class `0,0,1,0`, id `0,1,0,0`, inline `1,0,0,0`. A single id beats any number of classes. That one line explained a whole afternoon I once spent fighting a menu that refused to change colour.

The part I actually use now is the DevTools strikethrough. When a style is ignored, the losing rule is crossed out and the winner sits above it. I look there before touching the code — it is faster than guessing, and it does not make the stylesheet worse.
