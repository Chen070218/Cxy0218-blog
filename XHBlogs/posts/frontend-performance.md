---
title: "The site stuttered twice, so I traced it twice"
date: "2026-10-16 14:00:00"
tags: ["Performance", "Images", "CSS"]
mood: "Relieved"
cover: "/screenshots/04-photowall.webp"
description: "Slow first paint on my phone, janky page transitions, images popping in one by one — and how I tracked each problem down."
---

After the site first went live, I opened it on my own phone and the experience was bad: a blank screen for a few seconds, then images popping in one by one, and a stutter when I tapped the nav to switch pages. I assumed my network was bad, but switching between WiFi and mobile data made no difference, so I had to look into it.

![The photo wall opens smoothly now](/screenshots/04-photowall.webp)

## The blank screen was the worst of it

Open the page and there's nothing; a few seconds later everything appears at once. I went through the CSS and found the problem: the whole page was set to `opacity: 0; visibility: hidden`, and only became visible after the JS loaded and the splash screen finished playing. If the JS was even a little slow, or threw an error, the user got nothing but white.

The fix was to keep the content in place and make the splash screen only a mask on top of it that fades out when it finishes; I also cut the animation from 2.2 seconds to 1.2. That was the most direct change, and afterwards the first paint appeared almost instantly.

## Images: if the image host won't resize them, compress them yourself

The photos in the album all linked straight to the full-size images on the image host, around 900KB each, the largest 945KB. I tried appending the resizing parameters used by Alibaba OSS, Qiniu and Upyun to the URL, but the original image still came back, which meant image processing wasn't enabled on their side.

In the end I just downloaded the twenty images, resized them all to a width of at most 1600 and converted them to WebP, put them in the project's `public/photos/`, and changed the data to point at the in-site paths. Before compression they were 13.9MB in total, afterwards 2.9MB, with most single images a bit over 100KB.

One related trap: after switching to static export, Next's built-in image optimization stops working (there's no server), so the images have to be compressed ahead of time; you can't count on it converting them at runtime.

## Too many animations, and a few of them written wrong

I counted the looping animations that run all the time: 150 blades of grass, 50 fireflies, 40 cherry blossom petals, plus a dozen or so danmaku lines — roughly 250 elements constantly moving. No wonder a phone can't keep up.

First I cut the numbers to a quarter (40 blades of grass, 18 fireflies, 20 petals). Then I dealt with a few implementation issues:

The fireflies used to animate `box-shadow`, which meant repainting a large area on every frame; I switched them to a static glow and now animate only opacity and position. The danmaku used to animate the `right` property, which triggers layout calculations; I changed it to `transform: translate3d()` so the compositor handles it.

There was also a click ripple: the canvas had a `requestAnimationFrame` loop that never stopped, clearing the screen every frame even when there were no ripples. I changed it to start on click and stop once the ripple has been drawn.

```ts
const frame = () => {
  rafId = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  /* draw the ripples */
  if (ripples.length > 0) rafId = requestAnimationFrame(frame);
};
```

I also stop all the effects when the tab goes to the background, otherwise it's still burning CPU and battery back there.

## That stutter when switching pages

The page transition used to use framer-motion to change the whole page's opacity and position frame by frame in JS. The page also has a lot of frosted-glass cards, so the blur layer had to be recalculated frame by frame during the fade-in, and if you clicked quickly several animations would pile up on top of each other.

I changed it to a pure CSS animation and added a check: if you switch pages again within 600 milliseconds, skip the animation and show the page directly.

```tsx
const now = Date.now();
const isRapid = now - lastNavigationAt < 600;
lastNavigationAt = now;
```

## Fonts

All three fonts used to come from Google, which meant the build needed a network connection, and the Chinese serif font alone was several MB, so local builds often got stuck and failed at that step. I moved them to self-hosting; the Chinese one is the variable version of Source Han Serif, split into many small slices by unicode-range, so the browser only downloads the characters actually used on the page.

## Where it stands now

On a phone, the first open now shows content almost instantly, switching pages no longer stutters, and images no longer pop in one by one. The photo wall page went from over ten MB to just over three MB.

Still unsolved: the 3D page in the Creative Workshop still takes over a second on first load, because three.js and the models are both fairly big. I considered adding a more obvious loading indicator, but I haven't touched it for now.
