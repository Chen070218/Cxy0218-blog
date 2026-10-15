"use client";
import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig';
import { usePerfProfile } from './usePerfProfile';

/**
 * 背景图轮播：原来一次性挂 3 张全屏大图（含 2 秒透明度过渡），
 * 现在只渲染当前一张，并提前把下一张预加载好；切到后台就暂停轮播。
 * 另外整层做了模糊，替代原来那个覆盖全屏的 backdrop-blur（那个要跟着背景逐帧重新模糊）。
 */
export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);
  const images = siteConfig.bgImages;
  const { reducedMotion, visible } = usePerfProfile();

  // 提前预加载下一张，切换时才不会因为解码而卡一下
  useEffect(() => {
    if (images.length <= 1 || reducedMotion) return;
    const next = new Image();
    next.src = images[(index + 1) % images.length];
  }, [index, images, reducedMotion]);

  useEffect(() => {
    if (images.length <= 1 || reducedMotion || !visible) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [images.length, reducedMotion, visible]);

  const current = images[index] || images[0];

  return (
    <div className="absolute inset-0 z-[-10] overflow-hidden">
      <div
        key={index}
        className="absolute inset-0 transform-gpu bg-cover bg-center"
        style={{
          backgroundImage: `url(${current})`,
          filter: 'blur(10px)',
          transform: 'scale(1.08)',
          animation: reducedMotion ? undefined : 'bg-fade 1.6s ease-out',
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `@keyframes bg-fade { from { opacity: 0.35; } to { opacity: 1; } }` }} />
    </div>
  );
}