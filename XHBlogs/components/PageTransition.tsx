"use client";

import { ReactNode, useMemo } from "react";

/**
 * 页面进入动画：纯 CSS 实现（原来是 framer-motion 在 JS 里逐帧改整页 style，
 * 页面里又有大量 backdrop-blur 玻璃卡片要跟着重算，快速切页时会叠加成卡顿）。
 *
 * 另外做了一个「快速连续切页就跳过动画」的处理：
 * 如果你在上一次跳转后 600ms 内又点了一次，说明是在快速翻页，这时直接显示内容、
 * 不播动画——避免多个 0.8s 动画堆在一起抢主线程。
 * 系统开启「减少动态效果」时，CSS 里已统一关掉动画。
 */
let lastNavigationAt = 0;

export default function PageTransition({ children }: { children: ReactNode }) {
  const shouldAnimate = useMemo(() => {
    const now = Date.now();
    const isRapidNavigation = now - lastNavigationAt < 600;
    lastNavigationAt = now;
    return !isRapidNavigation;
  }, []);

  return <div className={shouldAnimate ? "page-enter" : undefined}>{children}</div>;
}