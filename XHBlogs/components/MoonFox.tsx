"use client";

import React, { useEffect, useState } from "react";
import MoonFoxSvg from "./MoonFoxSvg";
import { withBasePath } from "@/sitePath";

/** The nine states of the Xinyuehu desktop pet (the chibi poses from the design sheet) */
export type PetState = "idle" | "walk" | "happy" | "angry" | "sleep" | "curious" | "lie" | "think" | "interact";

/**
 * Art source: the 8 chibi poses from the Wuthering Waves Xinyuehu design sheet the user provided
 * (idle/walk/happy/angry/sleep/curious/lie/interact), cropped and cut out as transparent PNGs in public/pet/.
 * The thinking state reuses the "curious" pose.
 * If a sprite fails to load, this falls back to the hand-drawn SVG version (components/MoonFoxSvg.tsx), so the pet never disappears.
 */
const SPRITE_FILES: Record<PetState, string> = {
  idle: "/pet/idle.png",
  walk: "/pet/walk.png",
  happy: "/pet/happy.png",
  angry: "/pet/angry.png",
  sleep: "/pet/sleep.png",
  curious: "/pet/curious.png",
  lie: "/pet/lie.png",
  think: "/pet/curious.png",
  interact: "/pet/interact.png",
};

// When the site is hosted under a subpath (GitHub Pages), these static images need the prefix too
const SPRITES = Object.fromEntries(
  Object.entries(SPRITE_FILES).map(([key, file]) => [key, withBasePath(file)]),
) as Record<PetState, string>;

const ALL_SPRITES = Array.from(new Set(Object.values(SPRITES)));

export default function MoonFox({ state = "idle" }: { state?: PetState }) {
  const [failed, setFailed] = useState(false);
  const src = SPRITES[state] || SPRITES.idle;

  // Preload every pose so switching states does not flash white
  useEffect(() => {
    if (typeof window === "undefined") return;
    ALL_SPRITES.forEach((href) => {
      const img = new Image();
      img.src = href;
    });
  }, []);

  if (failed) return <MoonFoxSvg state={state === "interact" ? "happy" : state} />;

  return (
    <span className={`mfx-img mfx-img--${state} block w-full h-full relative`}>
      <img
        src={src}
        alt="Xinyuehu, the desktop fox"
        draggable={false}
        decoding="async"
        onError={() => setFailed(true)}
        className="w-full h-full object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)] select-none"
      />
      <style>{`
        .mfx-img { transform-origin: 50% 100%; }
        .mfx-img--idle > img { animation: mfx2-float 3.8s ease-in-out infinite; }
        .mfx-img--walk > img { animation: mfx2-walk 0.62s ease-in-out infinite; }
        .mfx-img--happy > img { animation: mfx2-hop 0.7s ease-in-out infinite; }
        .mfx-img--angry > img { animation: mfx2-shake 0.36s ease-in-out infinite; }
        .mfx-img--sleep > img { animation: mfx2-breathe 4.2s ease-in-out infinite; }
        .mfx-img--curious > img { animation: mfx2-tilt 3.2s ease-in-out infinite; }
        .mfx-img--lie > img { animation: mfx2-breathe 3.6s ease-in-out infinite; }
        .mfx-img--think > img { animation: mfx2-think 2.4s ease-in-out infinite; }
        .mfx-img--interact > img { animation: mfx2-hop 0.9s ease-in-out infinite; }

        @keyframes mfx2-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes mfx2-walk { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-3px) rotate(2deg); } }
        @keyframes mfx2-hop { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.04); } }
        @keyframes mfx2-shake { 0%,100% { transform: translateX(-1.8px) rotate(-1deg); } 50% { transform: translateX(1.8px) rotate(1deg); } }
        @keyframes mfx2-breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(1px) scale(1.02); } }
        @keyframes mfx2-tilt { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-7deg); } }
        @keyframes mfx2-think { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px) rotate(-3deg); } }

        @media (prefers-reduced-motion: reduce) {
          .mfx-img > img { animation: none !important; }
        }
      `}</style>
    </span>
  );
}
