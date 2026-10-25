"use client";
import SmartImage from '../../components/SmartImage';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../siteConfig';
import { formatDate } from '../../components/formatDate';

type Chatter = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  mood?: string;
  cover?: string;
  content: string;
};

export default function ChatterBoard({ chatters }: { chatters: Chatter[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    chatters.forEach(c => c.tags?.forEach(t => tags.add(t)));
    return ["All", ...Array.from(tags)];
  }, [chatters]);

  const filteredChatters = useMemo(() => {
    if (searchQuery.length > 0 && searchQuery.trim() === "") return [];
    const query = searchQuery.trim().toLowerCase();

    return chatters.filter(chatter => {
      const matchSearch = chatter.title.toLowerCase().includes(query) ||
                          chatter.content.toLowerCase().includes(query);
      const matchTag = activeTag === "All" || chatter.tags?.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [chatters, searchQuery, activeTag]);

  return (
    // 🌟 Core change: tighten the container's left and right padding px-3 md:px-10
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-10 py-6 md:py-10 pt-24 md:pt-28 relative z-10">

      <div className="mb-8 md:mb-14 text-center">
        {/* 🌟 Core change: responsive heading size */}
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-tighter">
          {siteConfig.chatterTitle || "Originium Research Notes"}
        </h1>
        <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium italic opacity-80">
          “ {siteConfig.chatterDescription || "Whatever comes to mind"} ”
        </p>
      </div>

      <div className="mb-8 md:mb-12 flex flex-col items-center gap-5 md:gap-8">
        <div className="relative w-full max-w-lg group px-2 md:px-0">
          {/* 🌟 Core change: a more compact search box on mobile */}
          <input
            type="text"
            placeholder="Search forgotten thoughts..." aria-label="Search musings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 pl-10 md:pl-14 text-sm md:text-base text-slate-800 dark:text-white shadow-lg md:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400 font-medium"
          />
          <svg className="w-4 h-4 md:w-6 md:h-6 absolute left-5 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 px-2 md:px-0">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-500 border ${
                activeTag === tag 
                ? 'bg-indigo-300 text-slate-950 border-indigo-500 shadow-md md:shadow-lg md:shadow-indigo-500/30 scale-105' 
                : 'bg-white/30 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {tag === "All" ? tag : `# ${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 Core change 1: the masonry layout is just columns-2, with tighter gap-3 */}
      <motion.div layout className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
        <AnimatePresence mode='popLayout'>
          {filteredChatters.map((chatter) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={chatter.slug}
              className="break-inside-avoid"
            >
              {/* 🌟 Core change 2: smaller card radius rounded-2xl */}
              <Link
                href={`/chatter/${chatter.slug}`}
                className="block rounded-2xl md:rounded-[32px] bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 shadow-md md:shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
              >
                {chatter.cover && (
                  // 🌟 Core change 3: image height adapts h-28 -> h-52
                  <div className="w-full h-28 md:h-52 overflow-hidden relative">
                    <SmartImage fill sizes="(max-width: 768px) 100vw, 640px" src={chatter.cover} alt="cover" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                    {/* 🌟 Core change 4: smaller mood badge */}
                    {chatter.mood && (
                      <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/20 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm border border-white/20 uppercase tracking-widest">
                        ✨ {chatter.mood}
                      </span>
                    )}
                  </div>
                )}

                {/* 🌟 Core change 5: internal padding squeezed hard p-3 md:p-7 */}
                <div className="p-3 md:p-7">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <div className="text-[8px] md:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider md:tracking-[0.2em] bg-indigo-500/5 dark:bg-indigo-400/10 px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-indigo-500/10">
                      {formatDate(chatter.date, true)}
                    </div>
                    {/* Mood display - no-cover version */}
                    {!chatter.cover && chatter.mood && (
                      <div className="text-[8px] md:text-[10px] font-black text-pink-600 dark:text-pink-400 bg-pink-500/5 dark:bg-pink-400/10 px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-pink-500/10">
                        {chatter.mood}
                      </div>
                    )}
                  </div>

                  {chatter.title && (
                    // 🌟 Core change 6: tighter title text-sm md:text-xl
                    <h2 className="text-sm md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 md:line-clamp-none">{chatter.title}</h2>
                  )}

                  {/* 🌟 Core change 7: tighter body text, capped lines */}
                  <div className="text-[10px] md:text-sm text-slate-600 dark:text-slate-300 leading-snug md:leading-relaxed line-clamp-4 md:line-clamp-5 opacity-90 font-medium italic">
                    {chatter.content}
                  </div>

                  {/* 🌟 Core change 8: smaller tags at the bottom */}
                  {chatter.tags && chatter.tags.length > 0 && (
                    <div className="mt-3 md:mt-6 flex flex-wrap gap-1 md:gap-2">
                      {chatter.tags.map(t => (
                        <span key={t} className="text-[8px] md:text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-500/5 dark:bg-white/5 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md border border-slate-500/10 dark:border-white/5 transition-all group-hover:bg-indigo-500/10 group-hover:text-indigo-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
