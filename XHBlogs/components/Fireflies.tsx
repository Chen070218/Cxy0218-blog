"use client";
import { useEffect, useState } from 'react';
import { usePerfProfile } from './usePerfProfile';

interface Firefly {
  id: number;
  top: string;
  left: string;
  size: number;
  breatheDuration: number;
  breatheDelay: number;
  floatDuration: number;
  floatDelay: number;
  floatPath: string;
}

/** 萤火虫：夜里出现的装饰粒子（数量按性能档位缩放，只在合成层跑动画） */
export default function Fireflies() {
  const { scale, visible } = usePerfProfile();
  const [flies, setFlies] = useState<Firefly[]>([]);

  useEffect(() => {
    const count = Math.round(18 * scale);
    if (count <= 0) { setFlies([]); return; }
    setFlies(Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 4,
      breatheDuration: 3 + Math.random() * 5,
      breatheDelay: Math.random() * -10,
      floatDuration: 15 + Math.random() * 20,
      floatDelay: Math.random() * -20,
      floatPath: `float${Math.floor(Math.random() * 4) + 1}`,
    })));
  }, [scale]);

  if (flies.length === 0) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden mix-blend-screen">
      <style>{`
        /* 只动 opacity / transform：这两样不触发重绘，交给 GPU 合成 */
        @keyframes fireflyBreathe {
          0%, 100% { opacity: 0; transform: scale(0.4); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes float1 { 0%,100% { transform: translate3d(0,0,0); } 33% { transform: translate3d(10vw,-15vh,0); } 66% { transform: translate3d(-5vw,-20vh,0); } }
        @keyframes float2 { 0%,100% { transform: translate3d(0,0,0); } 33% { transform: translate3d(-12vw,10vh,0); } 66% { transform: translate3d(8vw,15vh,0); } }
        @keyframes float3 { 0%,100% { transform: translate3d(0,0,0); } 33% { transform: translate3d(15vw,15vh,0); } 66% { transform: translate3d(-10vw,5vh,0); } }
        @keyframes float4 { 0%,100% { transform: translate3d(0,0,0); } 33% { transform: translate3d(-15vw,-10vh,0); } 66% { transform: translate3d(10vw,-15vh,0); } }
      `}</style>

      {flies.map(fly => (
        <div
          key={fly.id}
          className="absolute will-change-transform"
          style={{
            top: fly.top,
            left: fly.left,
            animation: `${fly.floatPath} ${fly.floatDuration}s ease-in-out infinite`,
            animationDelay: `${fly.floatDelay}s`,
            animationPlayState: visible ? 'running' : 'paused',
          }}
        >
          <div
            className="rounded-full will-change-transform"
            style={{
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              backgroundColor: 'rgba(200, 255, 200, 0.9)',
              // 静态光晕：原来放在动画里改 box-shadow，每帧都要重绘
              boxShadow: '0 0 8px 2px rgba(120, 255, 160, 0.55)',
              animation: `fireflyBreathe ${fly.breatheDuration}s ease-in-out infinite`,
              animationDelay: `${fly.breatheDelay}s`,
              animationPlayState: visible ? 'running' : 'paused',
            }}
          />
        </div>
      ))}
    </div>
  );
}