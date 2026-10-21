---
title: "After the OS lab: the commands I actually type"
cover: "/screenshots/06-post.webp"
date: "2026-10-14 20:30:00"
tags: ["Linux", "Operating Systems", "Command line"]
mood: ''
description: "Lab sessions mean commands I cannot remember, so I look them up. These are the ones I use most, and a few I got burned by."
---

The Operating Systems labs are all on Linux, where the graphical interface is mostly no help, so at first I had to search for every single step. A few weeks in, the same handful of commands keep coming up. I am writing them down so I do not have to go looking for them again next time.

## Listing directories

`ls -la` is the one I type most. Without `-a` you never see hidden files like `.bashrc`, and `-l` gives you permissions, size and modification time in one go. Early on I ran it with no flags, could not find the config file, and assumed it was not installed.

`cd -` jumps back to the previous directory. When I am switching back and forth between the source tree and the log directory, it is far nicer than typing `cd ../../..`.

## Finding things

```bash
find . -name "*.log"
grep -rn "error" .
```

The first time I used `grep` I forgot `-r`, so it only searched one file and kept finding nothing. `-n` prints line numbers, which makes it easy to jump to the spot in the editor.

For long files I open `less`, type `/` to search, and press `q` to quit. Using `cat` on a few hundred lines of log fills the terminal up, and scrolling back is a pain.

## Processes

```bash
ps aux | grep node
kill 12345
```

When a port is taken, I use this to find the process id first and then `kill` it. Usually I ask it to terminate normally and only reach for `kill -9` when it will not budge. Once I was lazy and went straight to `-9`, lost a file I had not finished writing, and have behaved myself since.

`top` shows CPU and memory, so whichever process is eating everything is obvious at a glance. It is a bit more useful than Task Manager because it shows the command-line arguments directly.

## Permissions

When a freshly written script refuses to run with `permission denied`, `chmod +x run.sh` takes care of it. I misused `rm -r` once and wiped a directory; there was no backup that time, so I had to rewrite everything — which is why I now run `ls` first to see exactly what I am about to delete.

## Why I prefer the command line

Not that it is much faster; the main thing is that commands compose: filter with `grep`, order with `sort`, count with `uniq -c` — one line and I know what I wanted from the log. In a GUI you click away at one item after another, and when you are done you cannot save it as a one-line command you can reuse.
