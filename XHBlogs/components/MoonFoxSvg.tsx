"use client";

import React from "react";

/** The eight states of the Xinyuehu desktop pet (idle/walk/happy/angry/sleep/curious/lie from the design sheet, plus a thinking state) */
export type PetState = "idle" | "walk" | "happy" | "angry" | "sleep" | "curious" | "lie" | "think";

// From the design sheet's color reference: cool tones, silver-white hair, red/black/white palette
const C = {
  hair: "#f4f1ee",
  hairShade: "#d9d3ce",
  hairDeep: "#bdb6b0",
  earTip: "#2c2429",
  skin: "#fdeae2",
  skinShade: "#f2cfc6",
  eye: "#cf3b34",
  eyeDeep: "#8e211d",
  lash: "#372c31",
  red: "#c22c2c",
  redDeep: "#8b1c1c",
  black: "#221c21",
  white: "#ffffff",
  gold: "#e5c07b",
  blush: "#f19a9a",
};

/**
 * Pet art: a chibi "Xinyuehu" (original SVG, no external images)
 * States: idle / walk / happy / angry / sleep / curious / lie / think
 * Note: no image-generation tool was available, so this is drawn as vectors and does not depend on PNG frame sequences; prefers-reduced-motion is supported.
 */
export default function MoonFoxSvg({ state = "idle" }: { state?: PetState }) {
  const closedEyes = state === "sleep" || state === "happy" || state === "lie";
  const halfEyes = state === "think";

  return (
    <svg viewBox="0 0 120 120" className={`mfx mfx--${state} w-full h-full overflow-visible`} role="img" aria-label="Xinyuehu (chibi desktop pet)">
      <defs>
        <radialGradient id="mfx-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#cfd9ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#cfd9ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mfx-tail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#eae5e1" />
          <stop offset="100%" stopColor="#c9c2bd" />
        </linearGradient>
        <linearGradient id="mfx-kimono" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#efe9e6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="62" r="46" fill="url(#mfx-glow)" opacity={state === "think" ? 0.9 : 0.5} />

      <g className="mfx-body">
        {/* Big tail */}
        <g className="mfx-tail">
          <path d="M78 88c20 6 34-4 33-20-1-13-14-20-25-15 12 4 18 12 16 20-2 10-12 15-24 15z" fill="url(#mfx-tail)" />
          <path d="M88 53c9 2 15 10 13 19 5-11-1-19-13-19z" fill={C.hairDeep} opacity="0.55" />
        </g>

        {/* Legs and shoes */}
        <ellipse cx="50" cy="104" rx="7" ry="4.6" fill={C.white} />
        <ellipse cx="70" cy="104" rx="7" ry="4.6" fill={C.white} />
        <ellipse cx="50" cy="107" rx="7.4" ry="3.2" fill={C.black} />
        <ellipse cx="70" cy="107" rx="7.4" ry="3.2" fill={C.black} />

        {/* Body (red/white/black Japanese style) */}
        <path d="M60 68c14 0 21 9 22 21 0 8-10 12-22 12s-22-4-22-12c1-12 8-21 22-21z" fill="url(#mfx-kimono)" />
        <path d="M40 84c3 10 3 15 2 19-6-3-9-8-9-14 0-3 3-5 7-5z" fill={C.red} />
        <path d="M80 84c-3 10-3 15-2 19 6-3 9-8 9-14 0-3-3-5-7-5z" fill={C.red} />
        <path d="M60 70c5 0 8 4 8 8l-8 6-8-6c0-4 3-8 8-8z" fill={C.black} />
        <path d="M60 70c3 0 5 2 5 5l-5 4-5-4c0-3 2-5 5-5z" fill={C.red} />
        <ellipse cx="60" cy="90" rx="15" ry="7" fill={C.black} opacity="0.9" />
        <path d="M52 88h16v3H52z" fill={C.gold} opacity="0.8" />

        {/* Hands */}
        <ellipse cx="40" cy="86" rx="5" ry="4" fill={C.white} />
        <ellipse cx="80" cy="86" rx="5" ry="4" fill={C.white} />

        {/* Hair (back layer) + head */}
        <ellipse cx="60" cy="60" rx="33" ry="31" fill={C.hair} />
        <circle cx="60" cy="54" r="29" fill={C.skin} />
        <path d="M31 54c0-16 13-27 29-27s29 11 29 27c0 4-1 7-2 10-4-12-14-19-27-19s-23 7-27 19c-1-3-2-6-2-10z" fill={C.hair} />
        <path d="M33 52c4-11 14-17 27-17s23 6 27 17c-6-7-16-10-27-10s-21 3-27 10z" fill={C.hairShade} opacity="0.5" />
        {/* Long hair on both sides */}
        <path d="M32 58c-2 14-2 26 2 36 3-2 6-3 8-3-3-10-4-21-3-33z" fill={C.hair} />
        <path d="M88 58c2 14 2 26-2 36-3-2-6-3-8-3 3-10 4-21 3-33z" fill={C.hair} />
        <path d="M34 74c0 8 1 14 3 18-2 0-4 1-5 2-3-6-4-13-3-20z" fill={C.hairShade} opacity="0.45" />

        {/* Fox ears (white fur + black tips) */}
        <g className="mfx-ear mfx-ear-l">
          <path d="M38 32 30 6l26 16z" fill={C.hair} stroke={C.hairShade} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M38 32 30 6l10 10z" fill={C.earTip} />
          <path d="M40 29 36 14l14 8z" fill={C.blush} opacity="0.55" />
        </g>
        <g className="mfx-ear mfx-ear-r">
          <path d="M82 32 90 6 64 22z" fill={C.hair} stroke={C.hairShade} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M82 32 90 6l-10 10z" fill={C.earTip} />
          <path d="M80 29 84 14l-14 8z" fill={C.blush} opacity="0.55" />
        </g>
        {/* Ear ornament: little red flower */}
        <g>
          <circle cx="36" cy="30" r="2.6" fill={C.red} />
          <circle cx="32.6" cy="27.6" r="2.2" fill={C.red} opacity="0.9" />
          <circle cx="39.4" cy="27.4" r="2.2" fill={C.red} opacity="0.9" />
          <circle cx="36" cy="30" r="1" fill={C.gold} />
        </g>
        {/* Forehead mark */}
        <path d="M60 30a7 7 0 1 0 0 14 5.2 5.2 0 1 1 0-14z" fill={C.gold} opacity="0.85" />

        {/* Eyes */}
        <g className="mfx-eyes">
          {closedEyes ? (
            <g stroke={C.lash} strokeWidth="2.4" strokeLinecap="round" fill="none">
              <path d="M43 58q5-5 10 0" />
              <path d="M67 58q5-5 10 0" />
            </g>
          ) : (
            <g>
              <ellipse cx="48" cy="58" rx="5.6" ry={halfEyes ? 3.2 : 6.6} fill={C.white} />
              <ellipse cx="72" cy="58" rx="5.6" ry={halfEyes ? 3.2 : 6.6} fill={C.white} />
              <ellipse cx="48.6" cy="58.6" rx="4.4" ry={halfEyes ? 2.6 : 5.2} fill={C.eye} />
              <ellipse cx="72.6" cy="58.6" rx="4.4" ry={halfEyes ? 2.6 : 5.2} fill={C.eye} />
              <ellipse cx="48.6" cy="60.4" rx="2" ry="1.4" fill={C.eyeDeep} opacity="0.7" />
              <ellipse cx="72.6" cy="60.4" rx="2" ry="1.4" fill={C.eyeDeep} opacity="0.7" />
              <circle cx="46.6" cy="55.6" r="1.9" fill={C.white} />
              <circle cx="70.6" cy="55.6" r="1.9" fill={C.white} />
              <circle cx="50" cy="61" r="0.9" fill={C.white} opacity="0.85" />
              <circle cx="74" cy="61" r="0.9" fill={C.white} opacity="0.85" />
              <path d="M42 52q6-3 12 0" stroke={C.lash} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M66 52q6-3 12 0" stroke={C.lash} strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>

        {/* Brows (lowered when angry) */}
        {state === "angry" && (
          <g stroke={C.lash} strokeWidth="2" strokeLinecap="round">
            <path d="M43 48l11 3" />
            <path d="M77 48l-11 3" />
          </g>
        )}

        {/* Blush */}
        <g fill={C.blush} opacity={state === "happy" ? 0.7 : 0.42}>
          <ellipse cx="38" cy="64" rx="6" ry="3.6" />
          <ellipse cx="82" cy="64" rx="6" ry="3.6" />
        </g>

        {/* Mouth */}
        {state === "happy" ? (
          <path d="M56 68q4 5 8 0q-4 3-8 0z" fill={C.lash} />
        ) : state === "angry" ? (
          <path d="M56 70q4-4 8 0" stroke={C.lash} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M57 68q3 2.4 6 0" stroke={C.lash} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        )}
      </g>

      {/* Sleeping: Zzz */}
      {state === "sleep" && (
        <g className="mfx-zzz" fill={C.hairDeep} fontStyle="italic" fontWeight="900">
          <text x="86" y="34" fontSize="11">Z</text>
          <text x="94" y="24" fontSize="14">Z</text>
          <text x="103" y="14" fontSize="17">Z</text>
        </g>
      )}

      {/* Curious: question mark */}
      {state === "curious" && (
        <g className="mfx-mark">
          <circle cx="94" cy="26" r="11" fill={C.white} opacity="0.9" />
          <text x="94" y="31" fontSize="15" fontWeight="900" textAnchor="middle" fill={C.red}>?</text>
        </g>
      )}

      {/* Angry: anger mark */}
      {state === "angry" && (
        <g className="mfx-mark" stroke={C.red} strokeWidth="2.2" strokeLinecap="round">
          <path d="M88 22v12" />
          <path d="M82 28h12" />
          <path d="M90 20v6" opacity="0.7" />
        </g>
      )}

      {/* Happy: floating hearts */}
      {state === "happy" && (
        <g className="mfx-hearts" fill={C.blush}>
          <path className="mfx-heart mfx-heart-1" d="M92 30c1.6-3 6-2.4 6 1 0 2.4-3 4.6-6 7-3-2.4-6-4.6-6-7 0-3.4 4.4-4 6-1z" />
          <path className="mfx-heart mfx-heart-2" d="M28 34c1.2-2.2 4.4-1.8 4.4 0.8 0 1.8-2.2 3.4-4.4 5.2-2.2-1.8-4.4-3.4-4.4-5.2 0-2.6 3.2-3 4.4-0.8z" />
        </g>
      )}

      {/* Thinking: moon halo */}
      {state === "think" && (
        <g className="mfx-halo">
          <circle cx="60" cy="54" r="38" fill="none" stroke={C.gold} strokeWidth="1.6" strokeDasharray="7 9" opacity="0.85" />
        </g>
      )}

      <style>{`
        .mfx { transform-origin: 50% 62%; }
        .mfx-body { animation: mfx-float 3.8s ease-in-out infinite; }
        .mfx-tail { transform-origin: 78px 88px; animation: mfx-tail 2.9s ease-in-out infinite; }
        .mfx-ear { animation: mfx-ear 5.4s ease-in-out infinite; }
        .mfx-ear-l { transform-origin: 38px 32px; }
        .mfx-ear-r { transform-origin: 82px 32px; }
        .mfx-eyes { transform-origin: 60px 58px; animation: mfx-blink 5.2s infinite; }
        .mfx-mark { animation: mfx-pop 1.6s ease-in-out infinite; transform-origin: 90px 26px; }
        .mfx-zzz text { animation: mfx-zzz 3s ease-in-out infinite; }
        .mfx-zzz text:nth-child(2) { animation-delay: .4s; }
        .mfx-zzz text:nth-child(3) { animation-delay: .8s; }
        .mfx-heart { transform-origin: center; animation: mfx-heart 2.4s ease-in-out infinite; }
        .mfx-heart-2 { animation-delay: .8s; }
        .mfx-halo { transform-origin: 60px 54px; animation: mfx-spin 3.4s linear infinite; }

        .mfx--walk { animation: mfx-walk 0.62s ease-in-out infinite; }
        .mfx--walk .mfx-tail { animation-duration: 0.9s; }

        .mfx--happy { animation: mfx-hop 0.72s ease-in-out infinite; }
        .mfx--happy .mfx-tail { animation-duration: 0.8s; }

        .mfx--angry { animation: mfx-shake 0.36s ease-in-out infinite; }
        .mfx--angry .mfx-ear-l { animation: none; transform: rotate(-16deg); }
        .mfx--angry .mfx-ear-r { animation: none; transform: rotate(16deg); }

        .mfx--sleep .mfx-body { animation: mfx-breathe 4.2s ease-in-out infinite; }
        .mfx--sleep .mfx-tail { animation-duration: 5.5s; }

        .mfx--curious .mfx-body { animation: mfx-float 3.8s ease-in-out infinite, mfx-tilt 3.2s ease-in-out infinite; }

        .mfx--lie { transform: translateY(6px) scaleY(0.9); }
        .mfx--lie .mfx-tail { animation-duration: 4.2s; }
        .mfx--lie .mfx-body { animation: mfx-breathe 3.6s ease-in-out infinite; }

        .mfx--think .mfx-body { animation-duration: 2.4s; }

        @keyframes mfx-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes mfx-walk { 0%,100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-3px) rotate(1.5deg); } }
        @keyframes mfx-hop { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.05); } }
        @keyframes mfx-shake { 0%,100% { transform: translateX(-1.6px); } 50% { transform: translateX(1.6px); } }
        @keyframes mfx-breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(1px) scale(1.02); } }
        @keyframes mfx-tilt { 0%,100% { rotate: 0deg; } 50% { rotate: -8deg; } }
        @keyframes mfx-tail { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(9deg); } }
        @keyframes mfx-ear { 0%,88%,100% { transform: rotate(0deg); } 92% { transform: rotate(-7deg); } 96% { transform: rotate(3deg); } }
        @keyframes mfx-blink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(0.08); } }
        @keyframes mfx-pop { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.15); opacity: 1; } }
        @keyframes mfx-zzz { 0% { opacity: 0; transform: translateY(4px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-8px); } }
        @keyframes mfx-heart { 0% { opacity: .2; transform: translateY(4px) scale(.8); } 45% { opacity: 1; transform: translateY(-4px) scale(1.05); } 100% { opacity: 0; transform: translateY(-12px) scale(.9); } }
        @keyframes mfx-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
          .mfx, .mfx * { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}