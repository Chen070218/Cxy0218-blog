"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../siteConfig";
import { usePerfProfile } from "./usePerfProfile";

/**
 * Site background: a theme background built from three stacked layers
 *
 *  1) Ambience layer: a few theme images cross-fading, slightly softened and dimmed (bright enough to see the picture) — plus a light/dark wash so body text stays legible
 *  2) Portrait layer: one crisp portrait on the right, faded into the background with a mask; hidden on narrow screens so it does not cover the text
 *  3) Vignette layer: darkened edges, keeping the center focused and the text easier to read
 *
 * Performance: switching uses an opacity transition only (composited layer); the carousel pauses in a background tab; it does not rotate when the system asks for reduced motion.
 */
export default function SiteBackground() {
  const config = siteConfig as typeof siteConfig & { portraitImage?: string; portraitAlt?: string };
  const images: string[] = config.bgImages || [];
  const portrait = config.portraitImage;
  const portraitAlt = config.portraitAlt || "Character portrait";

  const { reducedMotion, visible } = usePerfProfile();
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // The portrait is hidden by CSS on phones, but a hidden lazy <img> is still fetched;
  // don't render it at all below 768 px so a phone does not download ~180 KB it cannot see.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (images.length <= 1 || reducedMotion || !visible) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 12000);
    return () => clearInterval(timer);
  }, [images.length, reducedMotion, visible]);

  const current = images[index] || images[0];

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {/* 1) Ambience layer */}
      {current && (
        <div
          key={current}
          className="absolute inset-[-6%] bg-cover bg-center"
          style={{
            backgroundImage: `url(${current})`,
            filter: "blur(4px) saturate(1.05) brightness(0.62)",
            transform: "scale(1.02)",
            animation: reducedMotion ? undefined : "site-bg-fade 1.8s ease-out both",
          }}
        />
      )}

      {/* 2) Portrait layer */}
      {portrait && isDesktop && (
        <div className="hidden md:block absolute right-[-1%] top-0 bottom-0 w-[44%] max-w-[680px]">
          <img
            src={portrait}
            alt={portraitAlt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain object-bottom opacity-80"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 42%, rgba(0,0,0,0) 98%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 42%, rgba(0,0,0,0) 98%)",
            }}
          />
        </div>
      )}

      {/* 3) Vignette layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.05)_30%,rgba(2,6,23,0.72)_100%)]" />

      <style dangerouslySetInnerHTML={{ __html: `@keyframes site-bg-fade { from { opacity: 0; } to { opacity: 1; } }` }} />
    </div>
  );
}