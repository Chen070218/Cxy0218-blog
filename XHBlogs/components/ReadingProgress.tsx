"use client";

import { useEffect, useState } from "react";

/**
 * Thin reading-progress bar for long articles. Hidden from assistive tech
 * (aria-hidden) because it only mirrors the scroll position.
 */
export default function ReadingProgress({ targetId = "article-content" }: { targetId?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.getElementById(targetId);
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
        return;
      }
      const read = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(read / scrollable);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <div
        className="h-full bg-indigo-500 transition-[width] duration-150 ease-out"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
