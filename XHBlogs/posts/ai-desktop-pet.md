---
title: "The fox in the corner: from cut-out sprite to conversation partner"
date: "2026-10-16 11:30:00"
tags: ["React", "Interaction", "AI"]
mood: "Happy"
cover: "/screenshots/01-home.webp"
description: "Cutting out sprites, a state machine, Pomodoro hooks, a DeepSeek connection — and a few details I reworked more than once."
---

At first I just wanted something alive in the bottom-right corner of the page. I went through the concept art and picked Xinyuehu, the Moon Fox, from Wuthering Waves — moon, starlight, fox — which also matched the site's color scheme. But if she were just one static image, nobody would look at her after a couple of days, so I gave her three things: she moves on her own, she reacts when you click her, and she reminds me to take a break.

![Here she is in the bottom-right corner of the home page](/screenshots/01-home.webp)

## Cutting out the sprites was harder than expected

The concept art had eight small poses. I cropped them and cut each one out into a transparent PNG. The first version keyed by color, and it hollowed out her white hair — the background was light gray, too close in brightness to the white hair, so the color filter took both.

Then I changed approach: flood fill inwards from the four edges of the image, so only light areas connected to the border count as background, and any white inside the character is kept.

```python
med = np.asarray(region.filter(ImageFilter.MedianFilter(size=31))).astype(np.int16)
diff = np.abs(np.asarray(region).astype(np.int16) - med).sum(2)
bg_like = diff < 22
lab, _ = ndimage.label(bg_like)
border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
ink = ~np.isin(lab, list(border))     # not background = the character
```

After cutting out, each one is 40KB to 58KB. They live in `public/pet/` and are all preloaded during idle time, so switching poses doesn't flash white first.

## Nine states

Idle, walk, happy, angry, sleep, curious, lying down, thinking, interacting. In the end every behavior is just "switch to a different state", so the state machine itself isn't complicated.

The tricky part is that she has to look like she's living her own life. When nobody's paying attention she'll randomly walk a couple of steps or doze off, but I found that while I was chatting she'd still be wandering around beside the chat box, which felt off, so I added a few checks:

```ts
useEffect(() => {
  if (isThinking || showInput || speech) return;   // no wandering around while chatting
  const timer = setTimeout(() => {
    const pool = ['walk', 'curious', 'lie', 'idle', 'idle', 'sleep'];
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPetState(next);
    setTimeout(() => setPetState('idle'), next === 'sleep' ? 6000 : 4200);
  }, 9000 + Math.random() * 6000);
  return () => clearTimeout(timer);
}, [petState, isThinking, showInput, speech]);
```

Petting her head makes her happy, sending a message makes her think, a failed request makes her angry, and opening the input box is the interaction pose. I worked these out by trying them myself; without them she just looks like a sticker.

## How she hooks up to the Pomodoro timer

The Pomodoro timer lives in the toolbox, the desktop pet sits in the bottom-right corner of the page, and the two components know nothing about each other. At first I wanted the timer to call the pet's methods directly, but that was awkward to write — props passed down through layers, and easy to end up with a circular dependency.

In the end I used a custom window event as the middleman:

```ts
// Pomodoro: broadcast when a phase ends
window.dispatchEvent(new CustomEvent("pet-say", {
  detail: { text: "Focus time's over — go rest for 5 minutes", state: "happy", ms: 6000 }
}));
```

The pet only listens for `pet-say`; she doesn't need to know who sent it. Adding another feature later (say, having her say something when a check-in ends) just means firing the same event.

## Wiring chat up to DeepSeek

The conversation goes through `/api/chat`; the key lives only in an environment variable and never appears in the code. The frontend sends the last 8 turns along with the request, otherwise she can't remember what was said a moment before.

When no key is configured, the API clearly returns "not configured yet", and the pet says that out loud instead of spinning forever with no response. I added that message after deploying to Cloudflare, because static hosting and the version with a server behave differently.

## A few small things

The first time you open the page each day she says hello; the date is stored in localStorage so it only happens once a day. Sitting too long (12 minutes without moving) makes her remind me to stand up. When the system's "reduce motion" setting is on, all animations stop.

One thing still bothers me: the walking animation runs a bit fast, like she's rushing to finish homework. When I have time I'll slow the frame rate down.
