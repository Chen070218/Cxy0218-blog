"use client";
import { useEffect, useState } from 'react';
import { usePerfProfile } from './usePerfProfile';

interface Petal { id: number; left: string; size: number; duration: number; delay: number; }

/** Falling sakura petals: also composited only, count scaled by the performance profile */
export default function Sakura() {
  const { scale, visible } = usePerfProfile();
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const count = Math.round(20 * scale);
    if (count <= 0) { setPetals([]); return; }
    setPetals(Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 8 + Math.random() * 12,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * -15,
    })));
  }, [scale]);

  if (petals.length === 0) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      <style>{`
        @keyframes sakuraFall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate3d(15vw, 110vh, 0) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {petals.map(p => (
        <div
          key={p.id}
          className="absolute top-0 bg-pink-300/70 will-change-transform"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            borderRadius: '100% 0 100% 0',
            animation: `sakuraFall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            animationPlayState: visible ? 'running' : 'paused',
          }}
        />
      ))}
    </div>
  );
}