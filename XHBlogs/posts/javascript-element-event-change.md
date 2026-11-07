---
title: "The element, the event and the change"
date: "2026-10-29 21:15:00"
tags: ["JavaScript", "DOM", "Events"]
mood: "Proud"
cover: "/photos/own/course-js.webp"
description: "The JavaScript lesson in three questions: which element, which event, what changes — plus state, textContent and the red console message."
---

The JavaScript lesson began by pointing out that we had already written some: `nav.js` fetched a fragment and put it into the header, and the useless machine switched itself off. What the lesson did was give each part a name. The part I kept repeating to myself afterwards was the three-question reading habit:

1. **Which element?** — look for `querySelector` or `getElementById`
2. **Which event?** — look for `addEventListener` and the event name
3. **What changes?** — a value, a class, an attribute, a piece of text

Almost every interactive piece of the web is those three, and now I can find them in code I did not write.

## Where the script goes

A `<script>` in the `<head>` runs before the body exists, so every element it looks for is still `null`. The fixes:

- put the script at the end of the body, or
- put it in the head with `defer`, so it downloads immediately but runs after the page is parsed.

My own `nav.js` is loaded at the end of the body for exactly this reason.

## `const` first, `let` when it changes

```js
const siteName = 'My Site';   // never reassigned
let likes = 0;                // will change
```

`var` is the pre-2015 way. It works, but `let` and `const` were invented to fix its surprises. Names are case-sensitive: `likes` and `Likes` are two different variables.

And the one that catches everyone: text that looks like a number is still text.

```js
'5' + 1        // '51'
'5' * 2        // 10
Number('5') + 1 // 6
'5' == 5       // true
'5' === 5      // false
```

Everything a visitor types into a field arrives as text. Convert with `Number()` before calculating, and compare with `===`.

## The DOM is the page JavaScript can change

The browser does not keep my HTML file; it builds a tree. `querySelector` takes any CSS selector — the CSS lesson pays off here — and returns the first match, or `null`. Nothing matched is the most common JavaScript error there is.

For changing it, the important rule is:

> Change the class in JavaScript. Let CSS decide how it looks.

```js
button.classList.add('liked'); // JS decides when
```

not

```js
button.style.background = '#c2410c'; // JS decides how too
```

And for text, the security rule: use `textContent` for anything a visitor typed. `innerHTML` parses the value as HTML; a visitor could type an `<img onerror=...>` and run code on the page. That attack is called XSS. `innerHTML` with my own `nav.html` is fine — because I wrote that HTML and a stranger did not.

## State, then render

State is just a value: is the menu open, how many likes, which photo is large. The pattern is always the same:

```js
let likes = 0;

function render() {
  button.textContent = `♥ ${likes}`;
  button.classList.toggle('liked', likes > 0);
}

button.addEventListener('click', () => {
  likes++;
  render();
});

render();
```

Change the state, then draw it again. Forget `render()` in one path and the screen shows something that is no longer true. Frameworks exist to do this automatically; in plain JavaScript it is my job.

The useless machine exercise fit here too: an event (`change`), a state (on/off), and `setTimeout` to switch it back off after 800 ms.

## Reading the red message

One error stops the whole script at that line. The five messages the lesson listed, and what they really mean:

| Console says | Look at |
| --- | --- |
| `Cannot read properties of null` | `querySelector` found nothing — selector, script timing, element not rendered yet |
| `likse is not defined` | a name spelled two ways, or capitalisation |
| `Unexpected token` / `missing )` | a bracket, quote or comma is missing |
| `main.js … 404` | the `<script src>` path |
| `Failed to fetch` / CORS | the page was opened with `file://`; use Live Server |

No red message but nothing happens? Add a `console.log` inside the listener. If it never prints, the listener is on the wrong element.

The lesson's final habit is the one I am trying to keep: before changing code I did not write, find the element, the event and the change. That is usually enough to know what it does.

Full lesson: [webtech.landrock.io/slides/lesson-5-javascript.html](https://webtech.landrock.io/slides/lesson-5-javascript.html).
