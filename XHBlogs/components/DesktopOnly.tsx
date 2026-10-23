"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Mounts decorative desktop-only widgets (the pet, floating player, tool box,
 * canvas effects) only when the viewport is at least 768 px wide.
 *
 * The CSS used to hide them on phones, but hiding does not unmount: the pet
 * preloaded its eight sprites (~350 KB) on every phone visit. This gate stops
 * the component, and therefore the downloads, from running on small screens.
 */
export default function DesktopOnly({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  if (!isDesktop) return null;
  return <>{children}</>;
}
