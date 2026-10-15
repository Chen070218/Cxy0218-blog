"use client";

import { useEffect, useState } from 'react';

export type PerfProfile = {
  /** 系统是否要求减少动态效果（无障碍设置） */
  reducedMotion: boolean;
  /** 设备看起来偏弱（CPU 核心少 / 内存小） */
  lowPower: boolean;
  /** 页面是否在前台；切到别的标签页时应该暂停特效 */
  visible: boolean;
  /** 装饰性粒子的数量系数：1 = 正常，0.4 = 弱设备，0 = 不跑 */
  scale: number;
};

/**
 * 统一的性能档位：所有装饰性特效（粒子、弹幕、点击涟漪）都应该读它。
 * - 用户在系统里开了「减少动态效果」→ 完全不跑装饰特效
 * - 设备偏弱（核心数或内存 ≤ 4）→ 粒子数量降到 40%
 * - 标签页切到后台 → 暂停动画，不白烧 CPU
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