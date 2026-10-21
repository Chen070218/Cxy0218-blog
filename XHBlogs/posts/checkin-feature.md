---
title: "The check-in page: finding out where the hours really went"
date: "2026-10-16 10:00:00"
tags: ["Next.js", "Frontend", "Time management"]
mood: "Focused"
cover: "/screenshots/02-checkin.webp"
description: "Things I reworked several times while building it: the data model, the timer, the calendar colors, and export/backup."
---

All semester I had one question: how long do I actually study in a day. The Pomodoro timer only records one block at a time, and it does not remember what I was doing in that block. So I added a check-in page to the site: hit Start, hit Stop when the work is done, write a couple of lines about what you did, and give it a rating while you are at it.

![The check-in page as it looks now](/screenshots/02-checkin.webp)

## The data model changed twice

At first I overcomplicated it: I planned a separate state for "currently checking in", plus a separate start time and current record id. Halfway through I realized that was redundant — whether a record's `end` is `null` already tells you if it is still running.

```ts
export type CheckinRecord = {
  id: string;
  categoryId: string;
  start: string;
  end: string | null;   // null means the check-in is still running
  content: string;
  rating: number;
  blocked: boolean;
  nodes: { id: string; at: string; note: string }[];
};
```

This way the state survives a refresh, and you never get the mismatch where the status says you are checking in but the record has no `end`.

## One trap in the timer

The stopwatch re-renders once per second. My first version got this wrong: it opened a `setInterval` whether or not a check-in was running, so the timer kept going in the background after I switched to another page, and the console kept refreshing.

```ts
useEffect(() => {
  if (!running) return;
  const id = setInterval(() => setTick(v => v + 1), 1000);
  return () => clearInterval(id);   // without this line it runs forever
}, [running]);
```

Ending a check-in really only changes one field: fill in `end`. How long the session took is computed on read, so there is no need to store a duration — storing one could end up disagreeing with the start and end times.

## The calendar heatmap

The calendar started with a fixed set of color bands, and after two weeks of use it showed nothing: I study more at weekends and less on weekdays, so every day landed in one or two bands. I switched to five bands based on the day's minutes (0, 30, 60, 120+), and only then could I see the rhythm.

Every cell carries an `aria-label` with the day's total duration. Shade alone means nothing to a screen reader.

The streak count needed a small change too: if today has not started yet, count back from yesterday. It used to count straight from today, so opening the page in the morning showed "0-day streak" everywhere, which was pretty disheartening.

## Backup

The data only lives in the browser's localStorage, so it disappears on another device — which makes export and import non-optional. Import merges instead of overwriting, so one slip of the hand does not wipe today's records.

I open this page almost every day now. The biggest use is not the numbers looking good; it is seeing where the time actually goes. Next I want the Pomodoro timer to feed its minutes in automatically, so I do not have to keep two separate logs.
