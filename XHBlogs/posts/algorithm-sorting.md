---
title: "Sorting algorithms: choosing one, after writing them all"
cover: "/screenshots/09-resources.webp"
date: "2026-10-14 19:30:00"
tags: ["Algorithms", "Data structures", "Complexity"]
mood: ''
description: "I implemented bubble, insertion, merge, quicksort and heapsort, hit a few traps, and ended up with a comparison table."
---

The assignment for Algorithms and Data Structures was to implement several common sorts and then compare their running times. While writing them they all felt about the same; once the numbers came in, the differences were not small at all.

## Bubble and insertion

Bubble sort is the easiest to write: two nested loops, compare a pair of neighbors, swap them if they are out of order. The trouble is the number of swaps — with ten thousand numbers you can already feel how slow it is.

Insertion sort is not hard either: each time you take one element and insert it into the already-sorted part in front. I had assumed it was as slow as bubble sort, but it measured noticeably faster on small inputs, or on data that is already close to sorted — because it only moves elements when it has to.

## Quicksort cost me a night

Quicksort itself is easy: pick a pivot, put the smaller elements on the left and the larger ones on the right, then recurse. The problem was the test data. With random numbers it was fast; switch to an already sorted array and the program hung.

Eventually I worked it out. Taking the first element as the pivot means that on sorted input every partition peels off just one element, the recursion depth becomes n, and it degrades to O(n²). Picking the pivot at random fixed it.

## Merge and heap

Merge sort splits the array into two halves, sorts each half, then merges them. Its worst case is O(n log n) as well, and it is stable. The price is an extra buffer the same size as the original array.

Heapsort needs no extra space and its worst case is also O(n log n), but the constant factor is larger than quicksort's, and it is not stable. On the same hundred thousand numbers, heapsort measured slightly slower than quicksort.

## Into a table

The assignment asked for a comparison, so I put the complexities in the same table:

| Algorithm | Average | Worst | Extra space | Stable |
| --- | --- | --- | --- | --- |
| Bubble sort | O(n²) | O(n²) | O(1) | Stable |
| Insertion sort | O(n²) | O(n²) | O(1) | Stable |
| Merge sort | O(n log n) | O(n log n) | O(n) | Stable |
| Quicksort | O(n log n) | O(n²) | O(log n) | Not stable |
| Heapsort | O(n log n) | O(n log n) | O(1) | Not stable |

## How I would choose now

For tiny inputs, or data that is already nearly sorted, go straight to insertion sort: short code, small constant. If stability matters (sorting several times, by score and then by class, for example), use merge sort. In the general case quicksort is the least hassle, but the pivot has to be random — never take the first element. If memory is really tight and you do not want to fall over on adversarial input, heapsort is the safer bet.

One more thing I found out: the lecturer mentioned that the sort in the standard library is not a single algorithm — below a certain size it falls back to insertion sort. So in everyday code you just call the library; implementing these myself was mostly about understanding what happens inside.
