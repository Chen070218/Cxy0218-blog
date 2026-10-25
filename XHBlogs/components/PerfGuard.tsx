"use client";

import { useEffect } from "react";

/**
 * Watches the first two seconds of real frames. If the device is clearly
 * struggling (median frame > 22 ms, or a quarter of frames over 34 ms), the
 * document gets `perf-lite`, which hides the ambient canvas/pet layers through
 * CSS and keeps the static background. The result is remembered for the tab's
 * session so a slow machine does not have to re-measure on every page.
 *
 * It never runs when the visitor already asked for reduced motion — those
 * effects are gated off separately.
 */
export default function PerfGuard() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("perf-lite")) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceMotion) {
      root.classList.add("perf-lite");
      return;
    }

    let finished = false;
    let last = performance.now();
    const start = last;
    const gaps: number[] = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      if (gaps.length < 20) return;
      const sorted = [...gaps].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const slowRatio = gaps.filter((gap) => gap > 34).length / gaps.length;
      if (median > 22 || slowRatio > 0.25) {
        root.classList.add("perf-lite");
        try {
          sessionStorage.setItem("perfLite", "1");
        } catch {
          // Storage can be blocked; the class still applies for this page.
        }
      }
    };

    const tick = (now: number) => {
      if (finished) return;
      gaps.push(now - last);
      last = now;
      if (now - start >= 2000) finish();
      else requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    const onHidden = () => {
      if (document.hidden) finished = true;
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return null;
}
