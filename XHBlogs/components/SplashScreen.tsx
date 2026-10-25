"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../siteConfig';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // With ?nosplash=1 the splash screen is skipped (for screenshots/demos; normal visitors are unaffected)
    const skipSplash = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("nosplash");
    // Visitors who ask for reduced motion should not get a 1.2 s animated intro at all.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const hasSeenSplash = skipSplash || reduceMotion || sessionStorage.getItem('hasSeenSplash') === 'true';

    if (!hasSeenSplash) {
      setShow(true);
      const timer = setTimeout(() => {
        exitSplash();
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Fallback: make sure the class name is there on a direct visit
      document.documentElement.classList.add('splash-seen');
    }
  }, []);

  const exitSplash = () => {
    setShow(false);
    sessionStorage.setItem('hasSeenSplash', 'true');

    // [Key unlock]: near the end of the animation, add the class to <html> and the CSS reveals the content automatically
    setTimeout(() => {
      document.documentElement.classList.add('splash-seen');
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash-screen-container"
          exit={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-950 text-slate-100"
        >
          {/* hairline frame, echoing the archive/desktop reference */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-white/10 md:inset-8" />
          <p aria-hidden="true" className="absolute left-6 top-6 font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500 md:left-10 md:top-10">
            CXY0218 / Archive
          </p>
          <p aria-hidden="true" className="absolute bottom-6 right-6 font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500 md:bottom-10 md:right-10">
            Est. 2025
          </p>

          <div className="relative z-10 flex flex-col items-center px-6">
            <div className="relative mb-8 h-16 w-16 border border-white/15 p-1.5">
              <img decoding="async" src={siteConfig.avatarUrl} alt={siteConfig.avatarAlt} className="h-full w-full object-cover" />
            </div>

            <p className="font-display text-4xl uppercase tracking-wide text-slate-100 sm:text-6xl">
              {siteConfig.authorName}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.42em] text-indigo-300">Opening the archive</p>

            <div className="mt-12 h-px w-56 bg-white/10 md:w-72">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-indigo-300"
              />
            </div>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500">
              Loading · {siteConfig.handle}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}