---
title: "From an address bar to a painted page: what actually happens"
date: "2026-10-08 19:30:00"
tags: ["Web", "HTTP", "Fundamentals"]
mood: "Curious"
cover: "/photos/own/course-fundamentals.webp"
description: "URLs, DNS, one HTTP request and four DevTools panels — the first Web Technologies lesson, written down before I forget it."
---

The first Web Technologies lesson started with something I do a hundred times a day and had never actually thought about: typing an address and waiting for a page. The lesson took that loop apart into a client, a server, a URL, a DNS lookup and one HTTP exchange. I wrote the pieces below mostly so that I can explain them back, not because they are new.

## A URL is not one thing

The address bar hides seven parts. The useful ones for this course are:

| Part | Example | What it does |
| --- | --- | --- |
| scheme | `https:` | how the browser talks to the server |
| host / domain | `webtech.landrock.io` | which machine, and who owns the name |
| port | `:443` | which door on that machine |
| path | `/course` | which resource I am asking for |
| query | `?week=2` | parameters sent to the server |
| fragment | `#cascade` | a place in the page — the server never sees it |

The fragment being client-only was the detail I had wrong. I used to think the server received the whole URL; it does not receive the `#...` part at all.

## DNS is the phone book, and every level caches it

The browser cannot route to a name, only to a number. `webtech.landrock.io` goes through the browser cache, the operating system cache, the ISP resolver, and only then a DNS server. Because every level remembers, the lookup usually never leaves the machine.

I tried `nslookup` once from the terminal and got the address back in a line. It is a small thing, but now the "why is the new domain not working yet" question has a visible answer: DNS records take time to propagate.

## One request, one response

The whole web is a conversation. The browser asks:

```
GET /course HTTP/1.1
Host: webtech.landrock.io
```

and the server answers:

```
HTTP/1.1 200 OK
Content-Type: text/html
```

Everything else is detail on top of that. The status code is the part I now look at before anything else:

- **2xx** — it worked
- **3xx** — it moved; follow the new location
- **4xx** — I asked for something that is not there (404) or I am not allowed (403)
- **5xx** — the server broke, not me

The lesson summed it up as "4xx is your fault, 5xx is theirs", which is a good first sentence when something fails on a deployed site.

## DevTools is the instrument

The four panels that matter:

- **Elements** — the live DOM, and which CSS rules apply
- **Console** — JavaScript errors and one-line experiments
- **Network** — every request, its status, size and timing
- **Sources** — the actual files, and breakpoints

I keep the Network panel open when a site feels slow, and the Console open whenever a button does nothing. The lesson's point was that DevTools is not a tour; it is the instrument the whole semester is diagnosed with.

## The three pillars, and how to tell which one broke

HTML is structure, CSS is presentation, JavaScript is behaviour. The ordering matters: a page with no CSS still works, and a page whose JavaScript fails should still be readable.

When something is wrong, the symptom points at one file:

- tags visible or content in the wrong place → HTML
- everything looks unstyled → the CSS `<link>` path
- a control does nothing → JavaScript, open the Console
- an image is missing → the path

I also changed two habits after this lesson: file names all lowercase with hyphens, and relative paths for my own pages. Those two rules prevent the classic "it works on my laptop" failure when the site moves to a server.

The full lesson is at [webtech.landrock.io/slides/phase-1-fundamentals.html](https://webtech.landrock.io/slides/phase-1-fundamentals.html).
