---
title: "I finally see the box"
date: '2026-10-20 20:35:00'
tags:
- CSS
- Box model
mood: Enlightened
cover: /photos/own/course-boxmodel.webp
description: The live box-model demo made the arithmetic click.
---

The box-model demo from the course lets you drag width, padding and border and watch the computed size update on the right. I spent ten minutes moving sliders and saying "oh" out loud.

The difference is simple once it is visible: in `content-box`, `width` means the content only — padding and border are added outside it, so the element ends up wider than the number I wrote. In `border-box`, `width` includes them, and the element stays the size I asked for.

That is why the `* { box-sizing: border-box }` line is in every stylesheet. I had copied it from a template for months without knowing what it prevented.
