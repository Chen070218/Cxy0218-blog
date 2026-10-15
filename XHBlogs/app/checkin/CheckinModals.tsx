"use client";

import { Category, COLOR_PRESETS } from "./lib";

const overlay = "fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4";
const panel = "card-enter w-full rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-white/10 shadow-2xl p-6";
const input = "mt-1 w-full rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400";
const ghost = "px-4 py-2 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200";
const primary = "px-5 py-2 rounded-full text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors";

export default function CheckinModals({
  showAddCategory, onCloseAddCategory, catName, setCatName, catColor, setCatColor, onAddCategory,
  showManage, onCloseManage, categories, onUpdateCategory, onDeleteCategory,
  nodeFor, onCloseNode, nodeNote, setNodeNote, onAddNode,
}: {
  showAddCategory: boolean;
  onCloseAddCategory: () => void;
  catName: string;
  setCatName: (v: string) => void;
  catColor: string;
  setCatColor: (v: string) => void;
  onAddCategory: () => void;
  showManage: boolean;
  onCloseManage: () => void;
  categories: Category[];
  onUpdateCategory: (id: string, patch: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  nodeFor: string | null;
  onCloseNode: () => void;
  nodeNote: string;
  setNodeNote: (v: string) => void;
  onAddNode: (recordId: string) => void;
}) {
  return (
    <>
      {showAddCategory && (
        <div className={overlay} onClick={onCloseAddCategory}>
          <div role="dialog" aria-modal="true" aria-label="新建分类" onClick={(e) => e.stopPropagation()} className={`${panel} max-w-md`}>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">新建分类</h2>
            <label className="mt-4 block text-xs font-bold text-slate-600 dark:text-slate-300">
              名称
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="例如：算法刷题" className={input} />
            </label>
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">颜色</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`选择颜色 ${color}`}
                    aria-pressed={catColor === color}
                    onClick={() => setCatColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${catColor === color ? "ring-2 ring-indigo-400" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onCloseAddCategory} className={ghost}>取消</button>
              <button type="button" onClick={onAddCategory} className={primary}>确认添加</button>
            </div>
          </div>
        </div>
      )}

      {showManage && (
        <div className={overlay} onClick={onCloseManage}>
          <div role="dialog" aria-modal="true" aria-label="分类管理" onClick={(e) => e.stopPropagation()} className={`${panel} max-w-xl max-h-[85vh] overflow-y-auto`}>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">分类管理</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">隐藏的分类不会出现在打卡按钮区；删除分类不会删掉已有记录。</p>
            <div className="mt-4 flex flex-col gap-3">
              {categories.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 p-3">
                  <input
                    value={c.name}
                    onChange={(e) => onUpdateCategory(c.id, { name: e.target.value })}
                    aria-label="分类名称"
                    className="flex-1 min-w-[8rem] rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`把 ${c.name} 改成 ${color}`}
                        onClick={() => onUpdateCategory(c.id, { color })}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${c.color === color ? "ring-2 ring-indigo-400" : ""}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <button type="button" onClick={() => onUpdateCategory(c.id, { hidden: !c.hidden })} className="text-xs px-3 py-1.5 rounded-full border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200">
                    {c.hidden ? "已隐藏" : "显示中"}
                  </button>
                  <button type="button" onClick={() => onDeleteCategory(c.id)} className="text-xs px-3 py-1.5 rounded-full border border-rose-400/40 text-rose-600 dark:text-rose-300 hover:bg-rose-500/10">删除</button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={onCloseManage} className={primary}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {nodeFor && (
        <div className={overlay} onClick={onCloseNode}>
          <div role="dialog" aria-modal="true" aria-label="添加记录节点" onClick={(e) => e.stopPropagation()} className={`${panel} max-w-md`}>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">记录一个节点</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">记下打卡过程中的小片段，会自动带上当前时间。</p>
            <textarea
              value={nodeNote}
              onChange={(e) => setNodeNote(e.target.value)}
              rows={3}
              placeholder="例如：写完排序作业的测试用例"
              className={`${input} mt-4`}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onCloseNode} className={ghost}>取消</button>
              <button type="button" onClick={() => onAddNode(nodeFor)} className={primary}>添加</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}