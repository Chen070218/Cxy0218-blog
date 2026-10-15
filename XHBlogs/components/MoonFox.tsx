"use client";

import React, { useEffect, useState } from "react";
import MoonFoxSvg from "./MoonFoxSvg";

/** 心月狐桌宠的九种状态（对应设定稿里的 Q 版姿势） */
export type PetState = "idle" | "walk" | "happy" | "angry" | "sleep" | "curious" | "lie" | "think" | "interact";

/**
 * 形象来源：用户提供的《鸣潮》心月狐设定稿里的 8 个 Q 版姿势（待机/走动/开心/生气/睡觉/好奇/趴着/互动），
 * 已裁切并抠成透明 PNG 放在 public/pet/。
 * 思考态复用「好奇」姿势。
 * 如果精灵图加载失败，自动回落到手绘 SVG 版（components/MoonFoxSvg.tsx），保证桌宠不会消失。
 */
const SPRITES: Record<PetState, string> = {
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

const ALL_SPRITES = Array.from(new Set(Object.values(SPRITES)));

export default function MoonFox({ state = "idle" }: { state?: PetState }) {
  const [failed, setFailed] = useState(false);
  const src = SPRITES[state] || SPRITES.idle;

  // 预加载全部姿势：状态切换时不会闪一下白
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
        alt="心月狐桌宠"
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