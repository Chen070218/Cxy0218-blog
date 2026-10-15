// 时间段打卡 · 公共类型与工具

export type Category = { id: string; name: string; color: string; hidden: boolean };
export type RecordNode = { id: string; at: string; note: string };
export type CheckinRecord = {
  id: string;
  categoryId: string;
  start: string;
  end: string | null;
  content: string;
  rating: number;
  blocked: boolean;
  nodes: RecordNode[];
};
export type Store = { categories: Category[]; records: CheckinRecord[] };

export const STORAGE_KEY = "xh-checkin-v1";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "study", name: "学习", color: "#6366f1", hidden: false },
  { id: "code", name: "写代码", color: "#0ea5e9", hidden: false },
  { id: "language", name: "德语 / 英语", color: "#f59e0b", hidden: false },
  { id: "read", name: "阅读", color: "#10b981", hidden: false },
  { id: "rest", name: "休息", color: "#94a3b8", hidden: false },
];

export const COLOR_PRESETS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#94a3b8"];

export const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const clock = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 一条记录到现在的分钟数（未结束就按当前时间算） */
export const minutesOf = (r: CheckinRecord) => {
  const end = r.end ? new Date(r.end).getTime() : Date.now();
  return Math.max(0, (end - new Date(r.start).getTime()) / 60000);
};

export const humanDuration = (min: number) => {
  const m = Math.round(min);
  if (m < 60) return `${m} 分钟`;
  return `${Math.floor(m / 60)} 小时 ${m % 60} 分`;
};

export const hms = (min: number) => {
  const s = Math.max(0, Math.round(min * 60));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export function isValidStore(value: any): value is Store {
  return (
    !!value &&
    Array.isArray(value.categories) &&
    Array.isArray(value.records) &&
    value.categories.every((c: any) => c && typeof c.id === "string" && typeof c.name === "string") &&
    value.records.every((r: any) => r && typeof r.id === "string" && typeof r.start === "string")
  );
}

/** 补齐老数据缺的字段，避免升级后崩溃 */
export function normalize(store: Store): Store {
  return {
    categories: store.categories.map((c) => ({ ...c, color: c.color || "#6366f1", hidden: !!c.hidden })),
    records: store.records.map((r) => ({
      ...r,
      content: typeof r.content === "string" ? r.content : "",
      rating: typeof r.rating === "number" ? r.rating : 5,
      blocked: !!r.blocked,
      nodes: Array.isArray(r.nodes) ? r.nodes : [],
    })),
  };
}

/** 月历格子的颜色深浅 */
export function intensityClass(minutes: number) {
  if (minutes <= 0) return "bg-slate-900/5 dark:bg-white/5";
  if (minutes < 30) return "bg-indigo-500/20";
  if (minutes < 60) return "bg-indigo-500/35";
  if (minutes < 120) return "bg-indigo-500/55";
  return "bg-indigo-500/75";
}