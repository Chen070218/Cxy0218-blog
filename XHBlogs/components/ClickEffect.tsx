"use client";
import { useEffect, useRef } from 'react';
import { usePerfProfile } from './usePerfProfile';

interface Ripple { x: number; y: number; r: number; velocity: number; opacity: number; }

/**
 * Click ripples: this used to have a requestAnimationFrame loop that never stopped,
 * clearing the full-screen canvas every frame even when there were no ripples. Now it runs only on click and stops once the ripple has spread out.
 */
export default function ClickEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = usePerfProfile();

  useEffect(() => {
    if (reducedMotion) return; // no click ripples when the system asks for reduced motion

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ripples: Ripple[] = [];
    let rafId: number | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const frame = () => {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(129, 140, 248, 0.5)';

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += rp.velocity;
        rp.velocity *= 0.96;
        rp.opacity -= 0.015;

        if (rp.opacity <= 0) { ripples.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${rp.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${rp.opacity * 0.3})`;
        ctx.fill();
      }

      // keep going only while there are ripples left
      if (ripples.length > 0) rafId = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, velocity: 2.5, opacity: 0.6 });
      if (rafId === null) rafId = requestAnimationFrame(frame);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      if (rafId !== null) cancelAnimationFrame(rafId);
      ripples.length = 0;
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
}