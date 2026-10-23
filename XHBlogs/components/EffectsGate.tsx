"use client";

import { ReactNode } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Renders decorative, continuously animating layers only when the visitor has not
 * asked for reduced motion. Content and navigation never go through this gate.
 */
export default function EffectsGate({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <>{children}</>;
}
