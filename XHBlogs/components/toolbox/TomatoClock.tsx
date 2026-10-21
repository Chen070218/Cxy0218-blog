"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pomodoro timer (25 minutes focus / 5 minutes break)
 *
 * Inspired by the Pomodoro feature in the reference desktop pet "Aimisi": when focus ends it notifies
 * the desktop pet through the window event 'pet-say', linking the pet and the tool.
 * Today's completed count is stored in localStorage.
 */

const FOCUS_MIN = 25;
const BREAK_MIN = 5;
const COUNT_KEY = "xh-pomodoro-done";

function say(text: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pet-say", { detail: { text, state: "happy", ms: 6000 } }));
}

export default function TomatoClock() {
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [left, setLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      setDone(raw ? Number(JSON.parse(raw)) || 0 : 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      return;
    }
    timer.current = setInterval(() => {
      setLeft((prev) => {
        if (prev > 1) return prev - 1;

        // One phase has ended
        if (phase === "focus") {
          const next = done + 1;
          setDone(next);
          try { localStorage.setItem(COUNT_KEY, JSON.stringify(next)); } catch {}
          say(`Focus session over — tomato #${next} done today～ go take a 5-minute break (๑•̀ㅂ•́)و✧`);
          setPhase("break");
          return BREAK_MIN * 60;
        }
        say("Break's over. Shall we keep going? This fox is right here with you (｡･ω･｡)ﾉ♡");
        setPhase("focus");
        return FOCUS_MIN * 60;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [running, phase, done]);

  const total = (phase === "focus" ? FOCUS_MIN : BREAK_MIN) * 60;
  const pct = Math.round(((total - left) / total) * 100);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const btn = "px-3 py-1.5 rounded-full text-xs font-bold border border-white/50 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-white/95 transition-colors";

  return (
    <div className="flex flex-col gap-3" aria-label="Pomodoro timer">
      <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-4 py-3 text-center">
        <p className="text-[11px] font-black tracking-widest text-slate-500 dark:text-slate-400">
          {phase === "focus" ? "Focusing" : "On a break"} · {done} done today
        </p>
        <p className="mt-1 text-3xl font-black tabular-nums text-slate-900 dark:text-white">{mm}:{ss}</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-900/10 dark:bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${phase === "focus" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={btn} onClick={() => setRunning((v) => !v)}>
          {running ? "Pause" : left === total ? "Start focus" : "Resume"}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => {
            setRunning(false);
            setPhase("focus");
            setLeft(FOCUS_MIN * 60);
          }}
        >
          Reset
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => {
            const next = phase === "focus" ? "break" : "focus";
            setPhase(next);
            setLeft((next === "focus" ? FOCUS_MIN : BREAK_MIN) * 60);
          }}
        >
          Switch to {phase === "focus" ? "break" : "focus"}
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
        25 minutes of focus, 5 minutes of break. The desktop pet will remind you when a phase ends.
      </p>
    </div>
  );
}