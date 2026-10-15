"use client";

import { Category, CheckinRecord, clock, humanDuration, minutesOf } from "./lib";

export default function RecordCard({
  record,
  category,
  categories,
  onUpdate,
  onDelete,
  onAddNode,
  onRemoveNode,
}: {
  record: CheckinRecord;
  category?: Category;
  categories: Category[];
  onUpdate: (patch: Partial<CheckinRecord>) => void;
  onDelete: () => void;
  onAddNode: () => void;
  onRemoveNode: (nodeId: string) => void;
}) {
  const small = "text-xs px-3 py-1.5 rounded-full border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors";

  return (
    <article className={`rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-700/30 p-4 ${record.blocked ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[11px] font-black text-white" style={{ backgroundColor: category?.color || "#64748b" }}>
          {category?.name || "未分类"}
        </span>
        <span className="text-sm font-black text-slate-900 dark:text-white">
          {clock(record.start)} – {record.end ? clock(record.end) : "进行中"}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-300">· {humanDuration(minutesOf(record))}</span>
      </div>

      <textarea
        value={record.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="这段时间做了什么？（只存在你自己的浏览器里）"
        rows={2}
        aria-label="这段时间做了什么"
        className="mt-3 w-full rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="评分">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} 星`}
              aria-pressed={record.rating === star}
              onClick={() => onUpdate({ rating: star })}
              className={`text-lg leading-none transition-transform hover:scale-110 ${star <= record.rating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
            >
              ★
            </button>
          ))}
        </div>

        <select
          value={record.categoryId}
          onChange={(e) => onUpdate({ categoryId: e.target.value })}
          aria-label="修改分类"
          className="text-xs rounded-full border border-white/50 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 text-slate-700 dark:text-slate-200"
        >
          <option value="">未分类</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button type="button" onClick={() => onUpdate({ blocked: !record.blocked })} className={small}>
          {record.blocked ? "解除屏蔽" : "屏蔽（不计入统计）"}
        </button>

        {!record.end && <button type="button" onClick={onAddNode} className={small}>📌 加节点</button>}

        <button
          type="button"
          onClick={onDelete}
          className="text-xs px-3 py-1.5 rounded-full border border-rose-400/40 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 transition-colors ml-auto"
        >
          🗑️ 删除
        </button>
      </div>

      {record.nodes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 border-l-2 border-indigo-400/40 pl-3" aria-label="记录节点">
          {record.nodes.map((n) => (
            <li key={n.id} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
              <time className="font-black text-indigo-600 dark:text-indigo-300" dateTime={n.at}>{clock(n.at)}</time>
              <span className="flex-1">{n.note}</span>
              <button type="button" onClick={() => onRemoveNode(n.id)} aria-label="删除节点" className="text-slate-400 hover:text-rose-500">×</button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}