"use client";

import { ReactNode, useMemo } from "react";

/**
 * Page enter animation: pure CSS now (it used to be framer-motion rewriting the whole page's style
 * every frame in JS, on a page that also has a lot of backdrop-blur glass cards to recompute,
 * so fast page switches piled up into jank).
 *
 * There is also a "skip the animation on rapid page switching" path:
 * if you click again within 600ms of the previous navigation, you are flipping pages quickly, so the
 * content is shown straight away and no animation plays — that avoids several 0.8s animations piling up
 * on the main thread. When the system's "reduce motion" setting is on, the CSS already turns animations off.
 */
let lastNavigationAt = 0;

export default function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const shouldAnimate = useMemo(() => {
    const now = Date.now();
    const isRapidNavigation = now - lastNavigationAt < 600;
    lastNavigationAt = now;
    return !isRapidNavigation;
  }, []);

  const classes = [className, shouldAnimate ? "page-enter" : null].filter(Boolean).join(" ");
  return <div className={classes || undefined}>{children}</div>;
}