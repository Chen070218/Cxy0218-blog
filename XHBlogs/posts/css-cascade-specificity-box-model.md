---
title: "The cascade explained the bug I had been staring at"
date: "2026-10-22 19:45:00"
tags: ["CSS", "Layout", "Debugging"]
mood: "Enlightened"
cover: "/photos/own/course-boxmodel.webp"
description: "Specificity, inheritance and the box model — why one CSS rule loses, and the difference between content-box and border-box."
---

The CSS lesson was the first one where I realised I had been guessing. My styles "worked" until they did not, and when a rule was ignored I usually added `!important` or a more specific selector until the page obeyed. The lesson gave the conflict a rulebook, and then a live box-model demo that made the arithmetic visible.

## A rule is three parts

```css
p {
  color: #333;
  font-size: 16px;
}
```

Selector, property, value. The semicolon ends a declaration; forgetting one silently breaks the next line. I have lost more time to a missing semicolon than to any complicated layout.

There are three ways to apply CSS: inline, internal and external. External wins for anything real — one file for the whole site, cached by the browser, and the styling stays out of the HTML.

## The cascade settles conflicts in a fixed order

When two rules target the same element:

1. **Importance** — is one marked `!important`?
2. **Specificity** — is one selector more specific?
3. **Order** — if still tied, the last one written wins.

Specificity is a four-part score:

| Selector | Score |
| --- | --- |
| `p` | 0,0,0,1 |
| `.intro` | 0,0,1,0 |
| `p.intro` | 0,0,1,1 |
| `#header` | 0,1,0,0 |
| `#header .nav` | 0,1,1,0 |
| `div#header .nav p` | 0,1,1,2 |

A single id beats any number of classes. That one line explained about a year of confusion for me.

The practical tip from the lesson: when a style refuses to apply, open DevTools. The overridden rule is struck through, and the winner is directly above it. I now look for the strikethrough before I change anything.

## `!important` is not a fix

It wins, and that is the problem. The next conflict needs another `!important`, and soon nothing can override anything. The real answer is almost always a cleaner selector or a better-organised stylesheet. I removed two `!important`s from my own stylesheet after this lesson and replaced them with a more specific parent selector.

## Inheritance: text flows down, boxes do not

Inherited properties are the text ones: `color`, `font-family`, `font-size`, `line-height`, `text-align`. Box properties — `margin`, `padding`, `border`, `background`, `width` — are not inherited. Setting text properties on `body` once is therefore enough; every element still decides its own box.

## The box model, with sliders

The live demo at [webtech.landrock.io/demos/box-model.html](https://webtech.landrock.io/demos/box-model.html) was the most useful five minutes of the lesson. You drag the width, padding and border sliders and watch the actual computed size on the right.

The surprise is `content-box` versus `border-box`:

- **content-box** — `width` means the content only; padding and border are added outside it, so the element becomes wider than the number I wrote.
- **border-box** — `width` includes padding and border; the element stays the size I asked for.

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

I had this line in my stylesheet because a template had it. Now I know why: it makes widths mean what a human expects.

The second demo, [Flexbox vs Grid](https://webtech.landrock.io/demos/flex-vs-grid.html), put the same items into both systems side by side. My rule of thumb after playing with it: one-dimensional rows or columns → flexbox; a real two-dimensional layout → grid. I use grid for the page shell and flexbox inside the header and cards.

Full lesson: [webtech.landrock.io/slides/phase-3-css.html](https://webtech.landrock.io/slides/phase-3-css.html).
