"use client";

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import {Beaker, Rocket, Trees, Wrench} from 'lucide-react'; // 🌟 Sofa icon temporarily removed
import { siteConfig } from '../../siteConfig'; // 🌟 import site config

import dynamic from 'next/dynamic';

// These two modules are not small (both bundle three.js), so load them on demand:
// entering the page no longer blocks the main thread parsing three.js; they load when you switch to that tab
const AlchemyLab = dynamic(() => import('./AlchemyLab'), {
  ssr: false,
  loading: () => <ModuleLoading label="Loading the alchemy lab…" />,
});
const DijiangModel = dynamic(() => import('./DijiangModel'), {
  ssr: false,
  loading: () => <ModuleLoading label="Loading the Dijiang model…" />,
});

function ModuleLoading({ label }: { label: string }) {
  return (
    <div className="w-full min-h-[420px] flex items-center justify-center rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-800/40">
      <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{label}</span>
    </div>
  );
}
// import OperatorRecreation from './OperatorRecreation'; // 🌟 commented out for now, easy to add back later

export default function CreativeWorkshopClient({ posts = [], chatters = [], moments = [] }: any) {
  const [currentMode, setCurrentMode] = useState<'alchemy' | 'model'>('alchemy'); // 🌟 only two modes kept for now

  // =========================================================
  // 🌟 [Realistic] saturating asymptotic EXP leveling (unlimited levels, difficulty capped)
  // =========================================================
  useEffect(() => {
    // 🌟 Kill switch: if the site owner disabled the level system in config, exit immediately and cost nothing
    if (!siteConfig.enableLevelSystem) return;

    try {
      // 1. Base content EXP
      const postsExp = posts.length * 50;
      const chattersExp = chatters.length * 20;
      const momentsExp = moments.length * 10;
      const contentExp = postsExp + chattersExp + momentsExp;

      // 2. Daily first-post check-in EXP (dedupe by exact publish date)
      const allActivities = [...posts, ...chatters, ...moments];
      const uniqueDays = new Set();

      allActivities.forEach(item => {
        if (item.date) {
          const dayString = new Date(item.date).toISOString().split('T')[0];
          uniqueDays.add(dayString);
        }
      });

      const checkInDays = uniqueDays.size;
      const checkInExp = checkInDays * 100;

      // 3. Sum the total EXP pool
      const totalExp = contentExp + checkInExp;

      // 4. 🌟 Saturating asymptote: grows sensibly at first, then approaches the 2150 EXP cap forever
      const getExpNeededForLevel = (lvl: number) => {
        if (lvl <= 1) return 150;
        return 150 + Math.floor((2000 * (lvl - 1)) / ((lvl - 1) + 10));
      };

      let level = 1;
      let remainingExp = totalExp;
      let expNeededForNextLevel = getExpNeededForLevel(level);

      // Subtract EXP in a loop to settle each level-up
      while (remainingExp >= expNeededForNextLevel) {
        remainingExp -= expNeededForNextLevel;
        level++;
        expNeededForNextLevel = getExpNeededForLevel(level);
      }

      // Percentage progress towards the next level
      const progressPercent = ((remainingExp / expNeededForNextLevel) * 100).toFixed(1);

      // 5. Print a suitably realistic Resonator profile to the console
      console.groupCollapsed(`🛡️ [Black Shores Data Terminal] Syncing Resonator cxy0218 full profile...`);
      console.log(`%c[Current level] Lv.${level}`, 'color: #6366f1; font-weight: 900; font-size: 16px; text-shadow: 0 0 4px rgba(99,102,241,0.3);');
      console.log(`%c[Level progress] ${remainingExp} / ${expNeededForNextLevel} EXP (${progressPercent}%)`, 'color: #10b981; font-weight: bold;');
      console.log(`[Total] ${totalExp} EXP`);
      console.log(`%c[Asymptotic formula] EXP_Next = 150 + Math.floor((2000 * (L-1)) / ((L-1) + 10)) [hard cap: 2150]`, 'color: #8b5cf6; font-style: italic;');
      console.table({
        'Posts published (50 EXP)': { 'Count': posts.length, 'EXP earned': postsExp },
        'Musings logged (20 EXP)': { 'Count': chatters.length, 'EXP earned': chattersExp },
        'Moments posted (10 EXP)': { 'Count': moments.length, 'EXP earned': momentsExp },
        'Calendar check-ins (100 EXP)': { 'Active days': checkInDays, 'EXP earned': checkInExp },
      });
      console.groupEnd();

    } catch (error) {
      console.error("EXP system calculation went off the rails: ", error);
    }
  }, [posts, chatters, moments]);
  // =========================================================

  return (
    <div className="min-h-screen relative pb-32 overflow-x-hidden">
      <Navbar />

      <main id="main-content">
      <PageTransition>
        <div className="w-full max-w-7xl mx-auto mt-24 px-4 sm:px-10 relative z-10 flex flex-col items-center">

          {/* Top heading bar */}
          <div className="w-full flex flex-col items-center mb-16 animate-fade-in-up text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-3 flex items-center justify-center gap-3 transition-colors duration-700">
              <Trees className="text-indigo-500" size={40} /> Spirit Realm
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wider mb-8 transition-colors duration-700">
              Two little things I put together myself: an alchemy bench for taking notes, and a 3D model you can spin around
            </p>

            {/* Mode switch */}
            <div className="flex bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1.5 rounded-full border border-white/50 dark:border-white/10 shadow-sm relative">
              <button
                onClick={() => setCurrentMode('alchemy')}
                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 flex items-center gap-2 ${currentMode === 'alchemy' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Beaker size={16} /> Memory Alchemy Lab
              </button>
              <button
                onClick={() => setCurrentMode('model')}
                className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 flex items-center gap-2 ${currentMode === 'model' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <Rocket size={16} /> Dijiang Ship
              </button>

              {/* 🌟 Third option, the Resonator lounge, is hidden for now */}

              {/* Sliding background pill: automatically splits into two equal halves */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-700 rounded-full z-0 shadow-sm border border-slate-100 dark:border-slate-600"
                style={{
                  width: 'calc(50% - 6px)', // 🌟 changed to half width each
                  left: currentMode === 'alchemy' ? '6px' : 'calc(50% + 2px)' // 🌟 position computed for the two modes
                }}
              />
            </div>
          </div>

          {/* Render the active child on demand */}
          <AnimatePresence mode="wait">
            {currentMode === 'alchemy' && (
              <AlchemyLab key="alchemy-view" posts={posts} chatters={chatters} moments={moments} />
            )}
            {currentMode === 'model' && (
              <DijiangModel key="model-view" posts={posts} chatters={chatters} moments={moments} />
            )}
            {/* 🌟 Third experiment hidden for now */}
          </AnimatePresence>

        </div>
      </PageTransition>
      </main>

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes potion-wave { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes bubble-rise { 0% { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(-40px) scale(0.5); opacity: 0; } }
      `}</style>
    </div>
  );
}
