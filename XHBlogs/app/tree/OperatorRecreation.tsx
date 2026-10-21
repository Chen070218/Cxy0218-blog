"use client";
import SmartImage from '../../components/SmartImage';
import { withBasePath } from '../../sitePath';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// ==========================================
// 🌟 Xinyuehu's personal voice lines
// ==========================================
const SHU_QUOTES = [
  "Eat well, rest well. Leave the rest to me.",
  "The harvest from this land will not come from prayer alone.",
  "You look thinner again. Come here — I made something good.",
  "Don't be picky. Every grain of food is hard-won.",
  "Storms come without warning, so supplies have to be ready in advance.",
  "Sow in spring, harvest in autumn — everything has its season.",
  "Walk slower, no rush. The crops in the field grow little by little too."
];

// ==========================================
// 🌟 Resonator lounge main component (new terminal comms bubble version)
// ==========================================
export default function OperatorRecreation() {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Mouse parallax system ---
  const mouseX = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const bgTranslateX = useTransform(smoothMouseX, [0, 0.1666, 0.8333, 1], ["8.333%", "0%", "0%", "-8.333%"]);

  // --- Voice bubble system ---
  const [currentQuote, setCurrentQuote] = useState("");
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const triggerRandomTalk = () => {
      const randomQuote = SHU_QUOTES[Math.floor(Math.random() * SHU_QUOTES.length)];
      setCurrentQuote(randomQuote);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4500); // how long the bubble stays up
    };

    const initialTimeout = setTimeout(triggerRandomTalk, 3000);
    const talkInterval = setInterval(() => {
      setTimeout(triggerRandomTalk, Math.random() * 3000);
    }, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(talkInterval);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    mouseX.set(x);
  };

  const handleMouseLeave = () => mouseX.set(0.5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full flex flex-col items-center z-10"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border-4 border-slate-200/50 dark:border-slate-700/50 bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Background layer */}
        <motion.div
          style={{ x: bgTranslateX }}
          className="absolute top-0 left-[-10%] w-[120%] h-[80%] z-0 pointer-events-none"
        >
          <SmartImage fill sizes="100vw" src="/recreation-bg.webp" alt="Background" className="object-cover object-top" />
        </motion.div>

        {/* Atmosphere overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-[5] pointer-events-none" />

        {/* Foreground layer */}
        <div className="absolute inset-0 z-[10] flex items-end justify-center pointer-events-none">
          <SmartImage fill sizes="100vw" src="/recreation-fg.webp" alt="Foreground" className="object-contain object-bottom" />
        </div>

        {/* === 🌟 Core layered setup: movement control layer === */}
        <motion.div
          className="absolute z-[30] w-64 h-64 pointer-events-none flex flex-col items-center justify-center"
          animate={{
            left: ["10%", "75%", "75%", "10%", "10%"]
          }}
          transition={{
            duration: 40,
            times: [0, 0.48, 0.5, 0.98, 1],
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ bottom: "12%" }}
        >
          {/* 🌟 New hard sci-fi voice bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                // 🌟 moved down: now bottom-[75%]
                className="absolute bottom-[50%] mb-2 left-1/2 -translate-x-1/2 min-w-[200px] max-w-[260px] z-50 pointer-events-none"
              >
                <div className="relative bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 p-3 shadow-[0_0_20px_rgba(0,0,0,0.6)] overflow-hidden">

                  {/* Top gradient tech accent bar */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#e0af68] to-transparent opacity-80" />

                  {/* Left identity accent line */}
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-[#e0af68]" />

                  {/* Bottom-right tactical corner mark */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-[2px] border-r-[2px] border-zinc-500/50" />

                  {/* Operator comms nameplate */}
                  <div className="flex items-center gap-2 mb-1.5 opacity-90">
                    <span className="text-[10px] font-mono font-bold text-[#e0af68] bg-[#e0af68]/15 px-1.5 py-0.5 border border-[#e0af68]/30">
                      SHU
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 tracking-widest">
                      COMMUNICATION
                    </span>
                  </div>

                  {/* Voice line text */}
                  <p className="text-[13px] text-zinc-100 font-medium tracking-wider leading-relaxed drop-shadow-md">
                    {currentQuote}
                  </p>

                  {/* Small tech pointer under the bubble */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-zinc-900/90" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === 🌟 Flip control layer === */}
          <motion.div
            className="w-full h-full relative"
            animate={{
              scaleX: [1, 1, -1, -1, 1]
            }}
            transition={{
              duration: 40,
              times: [0, 0.48, 0.5, 0.98, 1],
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {/* Main animated image (animated WebP; keep the native img because next/image would flatten it to a still) */}
            <img loading="lazy" decoding="async"
              src={withBasePath("/spine/shu/Shu.webp")}
              alt="Shu Walking"
              style={{ filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)" }}
              className="relative z-10 w-full h-full object-contain pointer-events-none"
            />
          </motion.div>

          {/* Ground shadow */}
          <div className="absolute bottom-[-3%] left-1/2 -translate-x-1/2 w-18 h-2 bg-black/50 blur-[3px] rounded-[100%] z-0" />
        </motion.div>

        {/* Screen scanline effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-[40]" />
      </div>

      <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded-b-full shadow-lg opacity-50 blur-[1px]" />
    </motion.div>
  );
}
