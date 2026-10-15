"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CalendarPanel from "./CalendarPanel";
import RecordCard from "./RecordCard";
import CheckinModals from "./CheckinModals";
import {
  Category, CheckinRecord, COLOR_PRESETS, DEFAULT_CATEGORIES, RecordNode, STORAGE_KEY, Store,
  clock, dateKey, hms, humanDuration, isValidStore, minutesOf, normalize, pad,
} from "./lib";

/**
 * 时间段打卡 · 月度记录
 *
 * 分类管理（颜色/隐藏/删除）、开始-结束计时打卡、备注与星级评分、记录节点、
 * 月历热力、统计与连续打卡天数、导出/导入 JSON 备份。
 * 数据只存在当前浏览器（localStorage），和本站课程周历、资料库一致——站点没有后端数据库。
 */
export default function CheckinBoard() {
  const [store, setStore] = useState<Store>({ categories: DEFAULT_CATEGORIES, records: [] });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [, setTick] = useState(0);

  const today = dateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthCursor, setMonthCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0].id);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(COLOR_PRESETS[0]);
  const [nodeFor, setNodeFor] = useState<string | null>(null);
  const [nodeNote, setNodeNote] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---------- 读写本地数据 ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isValidStore(parsed)) {
        const next = normalize(parsed);
        setStore(next);
        const first = next.categories.find((c) => !c.hidden);
        if (first) setSelectedCategory(first.id);
      } else {
        const initial: Store = { categories: DEFAULT_CATEGORIES, records: [] };
        setStore(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      setNotice("读取本地打卡数据失败，请检查浏览器存储设置。");
    } finally {
      setReady(true);
    }
  }, []);

  function persist(next: Store) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStore(next);
      return true;
    } catch {
      setNotice("保存失败：浏览器存储空间可能已满，建议先导出备份。");
      return false;
    }
  }

  /* ---------- 计时 ---------- */
  const running = useMemo(() => store.records.find((r) => !r.end) || null, [store.records]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  function startCheckin() {
    if (running) return;
    const record: CheckinRecord = {
      id: crypto.randomUUID(), categoryId: selectedCategory, start: new Date().toISOString(),
      end: null, content: "", rating: 5, blocked: false, nodes: [],
    };
    if (persist({ ...store, records: [record, ...store.records] })) {
      setSelectedDate(dateKey(new Date()));
      setNotice("已开始打卡。");
    }
  }

  function stopCheckin() {
    if (!running) return;
    const end = new Date().toISOString();
    const minutes = minutesOf({ ...running, end });
    persist({ ...store, records: store.records.map((r) => (r.id === running.id ? { ...r, end } : r)) });
    setSelectedDate(dateKey(new Date(running.start)));
    setNotice(`本次打卡 ${humanDuration(minutes)}，已记录，可以补备注和评分。`);
  }

  const updateRecord = (id: string, patch: Partial<CheckinRecord>) =>
    persist({ ...store, records: store.records.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  function removeRecord(id: string) {
    if (!confirm("删除这条打卡记录？")) return;
    persist({ ...store, records: store.records.filter((r) => r.id !== id) });
    setNotice("记录已删除。");
  }

  function addNode(recordId: string) {
    const note = nodeNote.trim();
    if (!note) return;
    const node: RecordNode = { id: crypto.randomUUID(), at: new Date().toISOString(), note };
    persist({ ...store, records: store.records.map((r) => (r.id === recordId ? { ...r, nodes: [...r.nodes, node] } : r)) });
    setNodeNote("");
    setNodeFor(null);
    setNotice("节点已添加。");
  }

  const removeNode = (recordId: string, nodeId: string) =>
    persist({ ...store, records: store.records.map((r) => (r.id === recordId ? { ...r, nodes: r.nodes.filter((n) => n.id !== nodeId) } : r)) });

  /* ---------- 分类 ---------- */
  const visibleCategories = store.categories.filter((c) => !c.hidden);
  const categoryById = (id: string) => store.categories.find((c) => c.id === id);

  function addCategory() {
    const name = catName.trim();
    if (!name) { setNotice("请填写分类名称。"); return; }
    const category: Category = { id: crypto.randomUUID(), name, color: catColor, hidden: false };
    if (persist({ ...store, categories: [...store.categories, category] })) {
      setSelectedCategory(category.id);
      setCatName(""); setCatColor(COLOR_PRESETS[0]); setShowAddCategory(false);
      setNotice(`分类「${name}」已添加。`);
    }
  }

  const updateCategory = (id: string, patch: Partial<Category>) =>
    persist({ ...store, categories: store.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  function deleteCategory(id: string) {
    if (!confirm("删除这个分类？已有记录会保留，但显示为「未分类」。")) return;
    const rest = store.categories.filter((c) => c.id !== id);
    persist({ ...store, categories: rest });
    if (selectedCategory === id) {
      const first = rest.find((c) => !c.hidden);
      if (first) setSelectedCategory(first.id);
    }
    setNotice("分类已删除。");
  }

  /* ---------- 备份 ---------- */
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ format: "xh-checkin", version: 1, data: store }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `打卡备份-${today}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > 8_000_000) throw new Error("请选择 8 MB 以内的备份文件。");
      const parsed = JSON.parse(await file.text());
      const incoming = parsed?.data ?? parsed;
      if (!isValidStore(incoming)) throw new Error("备份内容格式不正确。");
      const data = normalize(incoming);
      const merged: Store = {
        categories: [...store.categories, ...data.categories.filter((c) => !store.categories.some((old) => old.id === c.id))],
        records: [...store.records, ...data.records.filter((r) => !store.records.some((old) => old.id === r.id))],
      };
      if (persist(merged)) setNotice(`导入完成：分类 ${merged.categories.length} 个、记录 ${merged.records.length} 条。`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "导入失败。");
    }
  }

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    const active = store.records.filter((r) => !r.blocked);
    const todayRecords = active.filter((r) => dateKey(new Date(r.start)) === today);
    const prefix = `${monthCursor.getFullYear()}-${pad(monthCursor.getMonth() + 1)}`;
    const monthMinutes = active.filter((r) => dateKey(new Date(r.start)).startsWith(prefix)).reduce((s, r) => s + minutesOf(r), 0);
    const days = new Set(active.map((r) => dateKey(new Date(r.start))));
    let streak = 0;
    const cursor = new Date();
    if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    return {
      todayCount: todayRecords.length,
      todayMinutes: todayRecords.reduce((s, r) => s + minutesOf(r), 0),
      totalCount: active.length,
      monthMinutes,
      streak,
    };
  }, [store.records, monthCursor, today]);

  /* ---------- 月历 ---------- */
  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const list: Array<{ key: string; day: number | null; minutes: number }> = [];
    for (let i = 0; i < offset; i += 1) list.push({ key: `pad-${i}`, day: null, minutes: 0 });
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${pad(month + 1)}-${pad(day)}`;
      const minutes = store.records.filter((r) => !r.blocked && dateKey(new Date(r.start)) === key).reduce((s, r) => s + minutesOf(r), 0);
      list.push({ key, day, minutes });
    }
    return list;
  }, [monthCursor, store.records]);

  const dayRecords = useMemo(
    () => store.records.filter((r) => dateKey(new Date(r.start)) === selectedDate).sort((a, b) => a.start.localeCompare(b.start)),
    [store.records, selectedDate]
  );

  if (!ready) return <p className="text-sm text-slate-600 dark:text-slate-300" role="status">正在读取打卡数据…</p>;

  const chip = "px-3 py-1.5 rounded-full text-sm font-bold border transition-all duration-300";

  return (
    <div className="flex flex-col gap-6">
      {/* 控制台 */}
      <section aria-label="打卡控制台" className="rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400">分类</span>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={selectedCategory === c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`${chip} ${selectedCategory === c.id ? "text-white shadow-md" : "text-slate-700 dark:text-slate-200 border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-700/40"}`}
              style={selectedCategory === c.id ? { backgroundColor: c.color, borderColor: c.color, boxShadow: `0 6px 18px ${c.color}55` } : undefined}
            >
              {c.name}
            </button>
          ))}
          <button type="button" onClick={() => setShowAddCategory(true)} className={`${chip} border-dashed border-slate-400/60 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/50`}>＋ 新建</button>
          <button type="button" onClick={() => setShowManage(true)} className={`${chip} border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85`}>管理</button>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <button
            type="button"
            onClick={running ? stopCheckin : startCheckin}
            className={`flex-1 rounded-2xl px-6 py-5 text-left transition-all duration-300 shadow-lg ${running ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-indigo-500 text-white shadow-indigo-500/30 hover:bg-indigo-600"}`}
          >
            <span className="block text-xs font-black tracking-widest opacity-85">{running ? "正在打卡" : "准备开始"}</span>
            <span className="mt-1 block text-2xl md:text-3xl font-black">{running ? `${hms(minutesOf(running))} · 点此结束` : "开始打卡"}</span>
            {running && <span className="mt-1 block text-xs opacity-90">{clock(running.start)} 起 · {categoryById(running.categoryId)?.name || "未分类"}</span>}
          </button>

          <button
            type="button"
            disabled={!running}
            onClick={() => running && setNodeFor(running.id)}
            className={`rounded-2xl px-5 py-4 text-sm font-bold border transition-colors ${running ? "border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 hover:bg-white/85" : "border-white/30 dark:border-white/5 bg-white/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 cursor-not-allowed"}`}
          >
            📌 记录节点
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "今日打卡", value: `${stats.todayCount} 次` },
            { label: "今日时长", value: humanDuration(stats.todayMinutes) },
            { label: "本月时长", value: humanDuration(stats.monthMinutes) },
            { label: "总打卡", value: `${stats.totalCount} 次` },
            { label: "连续打卡", value: `${stats.streak} 天` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/50 dark:bg-slate-700/30 border border-white/40 dark:border-white/10 px-4 py-3">
              <dt className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400">{item.label}</dt>
              <dd className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 月历 + 当天明细 */}
      <section aria-label="月度记录" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarPanel
          year={monthCursor.getFullYear()}
          month={monthCursor.getMonth()}
          cells={cells}
          selectedDate={selectedDate}
          today={today}
          monthMinutes={stats.monthMinutes}
          onShiftMonth={(delta) => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1))}
          onSelectDate={setSelectedDate}
        />

        <div className="rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-7">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedDate} 的记录</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">共 {dayRecords.length} 条 · 合计 {humanDuration(dayRecords.reduce((s, r) => s + minutesOf(r), 0))}</p>

          <div className="mt-4 flex flex-col gap-3">
            {dayRecords.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                category={categoryById(r.categoryId)}
                categories={store.categories}
                onUpdate={(patch) => updateRecord(r.id, patch)}
                onDelete={() => removeRecord(r.id)}
                onAddNode={() => setNodeFor(r.id)}
                onRemoveNode={(nodeId) => removeNode(r.id, nodeId)}
              />
            ))}
            {dayRecords.length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-300">这天还没有记录。点上面的「开始打卡」，或者从月历里换一天看看。</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={exportBackup} className="px-4 py-2 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors">导出备份</button>
            <button type="button" onClick={() => fileInput.current?.click()} className="px-4 py-2 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors">导入备份（合并）</button>
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importBackup(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
        {notice || "打卡数据只保存在当前浏览器（和课程周历、资料库一样），换设备请先「导出备份」再导入。"}
      </p>
      <CheckinModals
        showAddCategory={showAddCategory}
        onCloseAddCategory={() => setShowAddCategory(false)}
        catName={catName}
        setCatName={setCatName}
        catColor={catColor}
        setCatColor={setCatColor}
        onAddCategory={addCategory}
        showManage={showManage}
        onCloseManage={() => setShowManage(false)}
        categories={store.categories}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        nodeFor={nodeFor}
        onCloseNode={() => setNodeFor(null)}
        nodeNote={nodeNote}
        setNodeNote={setNodeNote}
        onAddNode={addNode}
      />
    </div>
  );
}