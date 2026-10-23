"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's "prefers-reduced-motion" setting.
 * Ambient canvas effects and infinite CSS animations are skipped when it is on;
 * functional UI (navigation, forms, the pet as a character) stays usable.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reduced;
}
