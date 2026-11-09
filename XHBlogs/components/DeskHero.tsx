"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  ["Make it real, then make it better.", "先做出来，再做好。"],
  ["Keep the small things.", "小事也值得留住。"],
  ["One page at a time.", "一页一页来。"],
];

export default function DeskHero() {
  const [now, setNow] = useState<Date | null>(null);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = now?.getHours() ?? 0;
  const greeting = hour < 5 ? "Still awake" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const time = now
    ? now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const date = (now ?? new Date()).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <section aria-label="Today" className="mb-1 pt-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-white/40">
        {greeting}
      </p>

      <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <time
            dateTime={now?.toISOString()}
            className="block font-display text-[clamp(3.2rem,9vw,5.8rem)] font-semibold leading-none tracking-[-0.065em] text-slate-950 tabular-nums dark:text-[#f4f4f7]"
          >
            {time}
          </time>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-500 dark:text-white/50">
            <span>{date}</span>
            <span aria-hidden="true">·</span>
            <span>Danzhou, Hainan</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              online
            </span>
          </p>
        </div>

        <div className="max-w-md border-l-2 border-indigo-400/60 pl-4">
          <p className="text-[clamp(1.05rem,2vw,1.35rem)] leading-snug tracking-[-0.01em] text-slate-800 dark:text-[#f4f4f7]">
            {QUOTES[quote][0]}
          </p>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-white/45">{QUOTES[quote][1]}</p>
          <button
            type="button"
            onClick={() => setQuote((current) => (current + 1) % QUOTES.length)}
            className="mt-3 rounded-full border border-black/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 transition-colors hover:border-indigo-400/40 hover:text-indigo-600 dark:border-white/15 dark:text-white/45 dark:hover:text-indigo-300"
          >
            another ↻
          </button>
        </div>
      </div>
    </section>
  );
}
