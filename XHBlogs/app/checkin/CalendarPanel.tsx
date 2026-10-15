"use client";

import { humanDuration, intensityClass } from "./lib";

type Cell = { key: string; day: number | null; minutes: number };

export default function CalendarPanel({
  year,
  month,
  cells,
  selectedDate,
  today,
  monthMinutes,
  onShiftMonth,
  onSelectDate,
}: {
  year: number;
  month: number;
  cells: Cell[];
  selectedDate: string;
  today: string;
  monthMinutes: number;
  onShiftMonth: (delta: number) => void;
  onSelectDate: (key: string) => void;
}) {
  const btn = "px-3 py-1.5 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors";

  return (
    <div className="rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => onShiftMonth(-1)} className={btn} aria-label="上一个月">← 上月</button>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{year} 年 {month + 1} 月</h2>
        <button type="button" onClick={() => onShiftMonth(1)} className={btn} aria-label="下一个月">下月 →</button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {["日", "一", "二", "三", "四", "五", "六"].map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell) =>
          cell.day === null ? (
            <span key={cell.key} aria-hidden />
          ) : (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.key)}
              aria-pressed={selectedDate === cell.key}
              aria-label={`${cell.key}${cell.minutes > 0 ? "，打卡 " + humanDuration(cell.minutes) : "，没有打卡"}`}
              className={`aspect-square rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 ${intensityClass(cell.minutes)} ${
                selectedDate === cell.key ? "ring-2 ring-indigo-400" : "hover:scale-105"
              } ${cell.key === today ? "outline outline-1 outline-indigo-400/70" : ""}`}
            >
              <span className={cell.minutes >= 60 ? "text-white" : "text-slate-800 dark:text-slate-100"}>{cell.day}</span>
              {cell.minutes > 0 && (
                <span className={`text-[9px] ${cell.minutes >= 60 ? "text-white/90" : "text-slate-600 dark:text-slate-300"}`}>{Math.round(cell.minutes)}m</span>
              )}
            </button>
          )
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600 dark:text-slate-300">
        本月合计 <strong>{humanDuration(monthMinutes)}</strong> · 颜色越深表示当天投入时间越长
      </p>
    </div>
  );
}