"use client";

import { useEffect, useState } from 'react';

export type PerfProfile = {
  /** Whether the system asks for reduced motion (accessibility setting) */
  reducedMotion: boolean;
  /** The device looks weak (few CPU cores / little memory) */
  lowPower: boolean;
  /** Whether the page is in the foreground; effects should pause when another tab is active */
  visible: boolean;
  /** Particle-count factor for decorative effects: 1 = normal, 0.4 = weak device, 0 = off */
  scale: number;
};

/**
 * One shared performance profile: every decorative effect (particles, danmaku, click ripples) should read it.
 * - The user enabled "reduce motion" in the system → no decorative effects at all
 * - A weak device (4 cores or 4 GB memory, or less) → particle count drops to 40%
 * - The tab moves to the background → animations pause, no wasted CPU
 */
export function usePerfProfile(): PerfProfile {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(mq.matches);
    onMotion();
    mq.addEventListener('change', onMotion);

    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;
    setLowPower(cores <= 4 || memory <= 4);

    const onVisibility = () => setVisible(!document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mq.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { reducedMotion, lowPower, visible, scale: reducedMotion ? 0 : lowPower ? 0.4 : 1 };
}