"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "../../components/formatDate";
import CalendarPanel from "./CalendarPanel";
import RecordCard from "./RecordCard";
import CheckinModals from "./CheckinModals";
import {
  Category, CheckinRecord, COLOR_PRESETS, DEFAULT_CATEGORIES, RecordNode, STORAGE_KEY, Store,
  clock, dateKey, hms, humanDuration, isValidStore, minutesOf, normalize, pad,
} from "./lib";

/**
 * Time-block check-in · monthly log
 *
 * Category management (color/hide/delete), start-stop timed check-ins, notes and star ratings,
 * record nodes, a heat-mapped calendar, stats and the day streak, plus JSON export/import backups.
 * Data lives only in the current browser (localStorage), same as the course timetable and the
 * resource library — the site has no backend database.
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

  /* ---------- Read/write local data ---------- */
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
      setNotice("Could not read your local check-in data. Check your browser storage settings.");
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
      setNotice("Save failed: browser storage may be full. Export a backup first.");
      return false;
    }
  }

  /* ---------- Timer ---------- */
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
      setNotice("Check-in started.");
    }
  }

  function stopCheckin() {
    if (!running) return;
    const end = new Date().toISOString();
    const minutes = minutesOf({ ...running, end });
    persist({ ...store, records: store.records.map((r) => (r.id === running.id ? { ...r, end } : r)) });
    setSelectedDate(dateKey(new Date(running.start)));
    setNotice(`Checked in ${humanDuration(minutes)}. Saved — add a note and a rating whenever you like.`);
  }

  const updateRecord = (id: string, patch: Partial<CheckinRecord>) =>
    persist({ ...store, records: store.records.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  function removeRecord(id: string) {
    if (!confirm("Delete this check-in record?")) return;
    persist({ ...store, records: store.records.filter((r) => r.id !== id) });
    setNotice("Record deleted.");
  }

  function addNode(recordId: string) {
    const note = nodeNote.trim();
    if (!note) return;
    const node: RecordNode = { id: crypto.randomUUID(), at: new Date().toISOString(), note };
    persist({ ...store, records: store.records.map((r) => (r.id === recordId ? { ...r, nodes: [...r.nodes, node] } : r)) });
    setNodeNote("");
    setNodeFor(null);
    setNotice("Node added.");
  }

  const removeNode = (recordId: string, nodeId: string) =>
    persist({ ...store, records: store.records.map((r) => (r.id === recordId ? { ...r, nodes: r.nodes.filter((n) => n.id !== nodeId) } : r)) });

  /* ---------- Categories ---------- */
  const visibleCategories = store.categories.filter((c) => !c.hidden);
  const categoryById = (id: string) => store.categories.find((c) => c.id === id);

  function addCategory() {
    const name = catName.trim();
    if (!name) { setNotice("Enter a category name first."); return; }
    const category: Category = { id: crypto.randomUUID(), name, color: catColor, hidden: false };
    if (persist({ ...store, categories: [...store.categories, category] })) {
      setSelectedCategory(category.id);
      setCatName(""); setCatColor(COLOR_PRESETS[0]); setShowAddCategory(false);
      setNotice(`Category "${name}" added.`);
    }
  }

  const updateCategory = (id: string, patch: Partial<Category>) =>
    persist({ ...store, categories: store.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  function deleteCategory(id: string) {
    if (!confirm("Delete this category? Existing records stay, but show as Uncategorized.")) return;
    const rest = store.categories.filter((c) => c.id !== id);
    persist({ ...store, categories: rest });
    if (selectedCategory === id) {
      const first = rest.find((c) => !c.hidden);
      if (first) setSelectedCategory(first.id);
    }
    setNotice("Category deleted.");
  }

  /* ---------- Backup ---------- */
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ format: "xh-checkin", version: 1, data: store }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `checkin-backup-${today}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importBackup(file?: File) {
    if (!file) return;
    try {
      if (file.size > 8_000_000) throw new Error("Choose a backup file under 8 MB.");
      const parsed = JSON.parse(await file.text());
      const incoming = parsed?.data ?? parsed;
      if (!isValidStore(incoming)) throw new Error("That backup is not in the right format.");
      const data = normalize(incoming);
      const merged: Store = {
        categories: [...store.categories, ...data.categories.filter((c) => !store.categories.some((old) => old.id === c.id))],
        records: [...store.records, ...data.records.filter((r) => !store.records.some((old) => old.id === r.id))],
      };
      if (persist(merged)) setNotice(`Import done: ${merged.categories.length} categories, ${merged.records.length} records.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import failed.");
    }
  }

  /* ---------- Stats ---------- */
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

  /* ---------- Calendar ---------- */
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

  if (!ready) return <p className="text-sm text-slate-600 dark:text-slate-300" role="status">Reading your check-in data…</p>;

  const chip = "px-3 py-1.5 rounded-full text-sm font-bold border transition-all duration-300";

  return (
    <div className="flex flex-col gap-6">
      {/* Console */}
      <section aria-label="Check-in console" className="rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400">Category</span>
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
          <button type="button" onClick={() => setShowAddCategory(true)} className={`${chip} border-dashed border-slate-400/60 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/50`}>＋ New</button>
          <button type="button" onClick={() => setShowManage(true)} className={`${chip} border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85`}>Manage</button>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <button
            type="button"
            onClick={running ? stopCheckin : startCheckin}
            className={`flex-1 rounded-2xl px-6 py-5 text-left transition-all duration-300 shadow-lg ${running ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-indigo-300 text-slate-950 shadow-indigo-500/30 hover:bg-indigo-200"}`}
          >
            <span className="block text-xs font-black tracking-widest opacity-85">{running ? "Checking in" : "Ready"}</span>
            <span className="mt-1 block text-2xl md:text-3xl font-black">{running ? `${hms(minutesOf(running))} · tap to stop` : "Start check-in"}</span>
            {running && <span className="mt-1 block text-xs opacity-90">since {clock(running.start)} · {categoryById(running.categoryId)?.name || "Uncategorized"}</span>}
          </button>

          <button
            type="button"
            disabled={!running}
            onClick={() => running && setNodeFor(running.id)}
            className={`rounded-2xl px-5 py-4 text-sm font-bold border transition-colors ${running ? "border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 hover:bg-white/85" : "border-white/30 dark:border-white/5 bg-white/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 cursor-not-allowed"}`}
          >
            📌 Log a node
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Today", value: `${stats.todayCount} check-ins` },
            { label: "Time today", value: humanDuration(stats.todayMinutes) },
            { label: "This month", value: humanDuration(stats.monthMinutes) },
            { label: "All time", value: `${stats.totalCount} check-ins` },
            { label: "Streak", value: `${stats.streak} days` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/50 dark:bg-slate-700/30 border border-white/40 dark:border-white/10 px-4 py-3">
              <dt className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400">{item.label}</dt>
              <dd className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Calendar + that day's details */}
      <section aria-label="Monthly log" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Records for {formatDate(selectedDate)}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dayRecords.length} records · {humanDuration(dayRecords.reduce((s, r) => s + minutesOf(r), 0))} total</p>

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
              <p className="text-sm text-slate-600 dark:text-slate-300">Nothing recorded on this day yet. Tap “Start check-in” above, or pick another day on the calendar.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={exportBackup} className="px-4 py-2 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors">Export backup</button>
            <button type="button" onClick={() => fileInput.current?.click()} className="px-4 py-2 rounded-full text-sm font-bold border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-700/40 text-slate-700 dark:text-slate-200 hover:bg-white/85 transition-colors">Import backup (merge)</button>
            <input ref={fileInput} type="file" accept="application/json,.json" aria-label="Import check-in backup" className="hidden" onChange={(e) => { importBackup(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
        {notice || "Check-in data stays in this browser only (same as the course timetable and the resource library). Moving to another device? Export a backup first, then import it there."}
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