"use client";

import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';
import { usePerfProfile } from './usePerfProfile';

interface DanmakuItem { id: number; text: string; top: number; duration: number; delay: number; }

/** Background danmaku: transform-only animation (it used to animate right, which forced a reflow every frame) */
export default function DanmakuBackground() {
  const { scale, visible } = usePerfProfile();
  const [danmakus, setDanmakus] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const list = siteConfig.danmakuList || [];
    const count = Math.round(10 * scale);
    if (list.length === 0 || count <= 0) { setDanmakus([]); return; }

    setDanmakus(Array.from({ length: count }).map((_, i) => ({
      id: i,
      text: list[Math.floor(Math.random() * list.length)],
      top: Math.random() * 80 + 10,
      duration: Math.random() * 20 + 25,
      delay: Math.random() * 20,
    })));
  }, [scale]);

  if (danmakus.length === 0) return null;

  return (
    <div className="fixed top-28 h-[30vh] left-0 right-0 overflow-hidden pointer-events-none z-0">
      {danmakus.map((item) => (
        <div
          key={item.id}
          className="absolute whitespace-nowrap text-white/30 dark:text-white/10 font-bold text-lg tracking-wider select-none will-change-transform"
          style={{
            top: `${item.top}%`,
            left: '100%',
            animation: `danmaku-move ${item.duration}s linear ${item.delay}s infinite`,
            animationPlayState: visible ? 'running' : 'paused',
          }}
        >
          {item.text}
        </div>
      ))}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes danmaku-move {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-100vw - 100%), 0, 0); }
        }
      `}} />
    </div>
  );
}