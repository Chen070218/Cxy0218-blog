---
title: "HTML is an outline, not a pile of boxes"
date: "2026-10-15 20:10:00"
tags: ["HTML", "Accessibility", "Forms"]
mood: "Focused"
cover: "/photos/own/course-html.webp"
description: "Document structure, headings as an outline, links, images, tables, forms and semantic elements — the HTML lesson in my own words."
---

Before this lesson I thought HTML was mostly about putting things on a page: a heading here, a paragraph there, a `div` whenever I needed a container. The lesson pushed a different idea: HTML describes what each part **is**, and the browser, a screen reader and a search engine all read that description.

## The four lines that are not decoration

Every page starts with the same skeleton. Four lines in it prevent four real failures:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page title</title>
</head>
<body>
  ...
</body>
</html>
```

- `<!DOCTYPE html>` — otherwise the browser falls back to old quirks
- `lang="en"` — tells a screen reader how to pronounce the page
- `charset="UTF-8"` — without it, Chinese text and emoji become nonsense
- `viewport` — without it, a phone renders the desktop layout and shrinks it

I had copied this block for months without knowing what each line was for. Typing it by hand once fixed that.

## Headings are an outline

One `h1`, never skip a level. A screen reader user can jump between headings the way I skim a page with my eyes; skipping from `h1` to `h4` breaks that outline.

That also means heading levels are not font sizes. If a heading is too big, the answer is CSS, not a smaller heading number.

## Links, images, tables, forms

**Links.** Relative paths for my own pages (`about.html`, `images/hero.webp`), absolute URLs for other sites. Link text should make sense on its own — "my recent projects", not "click here". I had a few "here" links in old notes; they are gone now.

**Images.** `src` and `alt` are both required. The alt text describes the picture as if I were explaining it to someone on the phone. Purely decorative images get `alt=""` — empty but present.

**Tables.** Only for data, never for layout. The lesson was blunt about this: a layout table read aloud is incomprehensible. `<th>` is not a bold cell; it tells a screen reader that the cell labels a column.

**Forms.** Every input needs a real `<label>` connected with `for` and `id`. A placeholder is not a label, because it disappears the moment someone types. Choosing the right `type` (`email`, `tel`, `date`, `number`) gives validation and the right mobile keyboard for free.

## Semantic HTML: say what it is

The slide that stayed with me put two pieces of markup side by side. They look identical on screen:

```html
<!-- says nothing -->
<div class="header"><div class="nav">...</div></div>

<!-- says what it is -->
<header><nav>...</nav></header>
```

A class name means something to me. An element name means something to every machine that reads the page. The order to reach for when unsure:

1. navigation links → `<nav>`
2. main content → `<main>`
3. something that stands alone → `<article>`
4. a themed part with a heading → `<section>`
5. loosely related content → `<aside>`
6. none of the above → `<div>`

`<div>` is not wrong. It is the honest answer when nothing more specific fits.

## What I changed on my own site

After the lesson I went through the main layout and replaced the outer `div`s with `header`, `main` and `footer`, and made sure each page has exactly one `h1`. The home page heading outline now reads like a table of contents. I also checked every `<img>` for alt text and gave the decorative background images `alt=""`.

The part I am still practising is forms. The check-in page has inputs and labels, and I now check that every `id`/`for` pair actually matches — one wrong id silently disconnects the label, and nothing complains.

Full lesson: [webtech.landrock.io/slides/phase-2-html.html](https://webtech.landrock.io/slides/phase-2-html.html).
