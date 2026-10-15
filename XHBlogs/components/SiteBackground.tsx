"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "../siteConfig";
import { usePerfProfile } from "./usePerfProfile";

/**
 * 站点背景：三层叠出来的主题背景
 *
 *  1) 氛围层：几张主题图轮播，重度模糊 + 压暗，只负责色调 —— 因为糊掉了，低分辨率拉伸也看不出来
 *  2) 立绘层：右侧一张清晰立绘，用遮罩淡出到背景；窄屏隐藏，避免挡住正文
 *  3) 暗角层：四周压暗，让中间内容更聚焦，也让文字更好读
 *
 * 性能：切换只用 opacity 过渡（合成层）；切到后台暂停轮播；系统要求减少动效时不轮播。
 */
export default function SiteBackground() {
  const config = siteConfig as typeof siteConfig & { portraitImage?: string; portraitAlt?: string };
  const images: string[] = config.bgImages || [];
  const portrait = config.portraitImage;
  const portraitAlt = config.portraitAlt || "角色立绘";

  const { reducedMotion, visible } = usePerfProfile();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1 || reducedMotion || !visible) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % images.length), 12000);
    return () => clearInterval(timer);
  }, [images.length, reducedMotion, visible]);

  const current = images[index] || images[0];

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      {/* 1) 氛围层 */}
      {current && (
        <div
          key={current}
          className="absolute inset-[-6%] bg-cover bg-center"
          style={{
            backgroundImage: `url(${current})`,
            filter: "blur(26px) saturate(1.15) brightness(0.55)",
            transform: "scale(1.06)",
            animation: reducedMotion ? undefined : "site-bg-fade 1.8s ease-out both",
          }}
        />
      )}

      {/* 2) 立绘层 */}
      {portrait && (
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

      {/* 3) 暗角层 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.05)_30%,rgba(2,6,23,0.72)_100%)]" />

      <style dangerouslySetInnerHTML={{ __html: `@keyframes site-bg-fade { from { opacity: 0; } to { opacity: 1; } }` }} />
    </div>
  );
}