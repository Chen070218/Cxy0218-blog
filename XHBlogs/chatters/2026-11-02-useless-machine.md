---
title: "The machine that switches itself off"
date: '2026-11-02 22:05:00'
tags:
- JavaScript
- AI
mood: Amused
cover: /photos/own/course-js.webp
description: One switch, one timeout, and a small lesson about state.
---

The useless machine is a box with a switch. You turn it on; an arm comes out and turns it off again. That is the whole machine. It exists only to undo what you just did.

Ours was built with AI, which raised the real question of the lesson: can I explain every line? The answer turned out to be yes, because the code is only three ideas: a checkbox holds the state, a `change` listener reacts to it, and `setTimeout` schedules the reversal. When the timeout runs, it sets `checked = false`; changing it from code does not fire another `change`, so the machine does not argue with itself.

I like that the exercise is deliberately pointless. It makes the mechanics easier to see, because there is no feature to hide behind.
