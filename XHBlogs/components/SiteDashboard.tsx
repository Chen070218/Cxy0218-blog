"use client";

import { useEffect, useState } from 'react';
// 🌟 Pull in our control-center config
import { siteConfig } from '../siteConfig';

export default function SiteDashboard() {
  const [timeStr, setTimeStr] = useState('');
  const [uptimeStr, setUptimeStr] = useState('');

  // 🌟 Read the site launch time from the config
  const START_DATE = new Date(siteConfig.buildDate || '2026-03-23T00:00:00').getTime();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format the current time as HH:MM:SS
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Compute the uptime
      const diff = now.getTime() - START_DATE;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setUptimeStr(`${days}d ${hours}h`);
    };

    updateTime(); // run once on mount
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [START_DATE]);

  return (
    // A long strip spanning all 12 columns
    <div className="md:col-span-12 rounded-3xl bg-slate-950/75 backdrop-blur-md border border-white/15 shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch transition-colors duration-700 h-auto md:h-20 group">

      {/* Left: flip-clock effect (monospace font) */}
      <div className="bg-slate-900 dark:bg-black text-white px-8 py-4 md:py-0 flex items-center justify-center font-mono text-2xl md:text-3xl font-black tracking-widest shadow-inner relative overflow-hidden group-hover:text-indigo-400 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        {timeStr || '00:00:00'}
        {/* Fake split line through the middle of the flip clock */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/50"></div>
      </div>

      {/* Middle and right: status info */}
      <div className="flex-1 px-6 py-4 md:py-0 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm font-bold text-slate-300">

        {/* Uptime */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>System uptime: <span className="text-indigo-300 font-black">{uptimeStr}</span></span>
        </div>

        {/* Tech stack badges (🌟 mapped dynamically from the array in siteConfig) */}
        <div className="flex gap-2">
          {siteConfig.footerBadges?.map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/5 rounded-md shadow-sm flex items-center gap-1 border border-white/10"
            >
              <svg className={`w-3.5 h-3.5 ${badge.color}`} fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: badge.svg }} />
              {badge.name}
            </span>
          ))}
        </div>

        {/* ICP filing info (🌟 link and name read from siteConfig) */}
        {siteConfig.icpConfig && (
          <a
            href={siteConfig.icpConfig.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 transition-colors border-b border-dashed border-slate-400 dark:border-slate-500 pb-0.5"
          >
            {siteConfig.icpConfig.name}
          </a>
        )}

      </div>
    </div>
  );
}