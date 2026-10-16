---
title: "给博客加一个「时间段打卡」：从需求到上线的完整记录"
date: "2026-10-16 10:00:00"
tags: ["Next.js", "功能实现", "时间管理", "前端"]
mood: "专注"
cover: "/screenshots/02-checkin.webp"
description: "用分类、计时器、月历热力图和本地存储做一个时间记录工具：这篇把数据模型、核心代码、踩过的坑和取舍都写下来。"
---

## 为什么要做这个功能

站点原本只有文章、照片墙、课程表这些「记录结果」的东西，缺一块**记录过程**的：这一段时间到底花在哪儿了。于是做了一个「时间段打卡」页面：选分类 → 开始打卡 → 结束打卡 → 写备注打星 → 在月历上看这段时间的投入分布。

![时间段打卡的整体界面](/screenshots/02-checkin.webp)

## 一、先定数据模型

这个页面只有两种实体：**分类**和**记录**，记录下面还可以挂一串**节点**（打卡过程中的小备注）。用 TypeScript 写出来是这样：

```ts
// app/checkin/lib.ts
export type Category = { id: string; name: string; color: string; hidden: boolean };
export type RecordNode = { id: string; at: string; note: string };
export type CheckinRecord = {
  id: string;
  categoryId: string;
  start: string;          // ISO 时间
  end: string | null;     // null 表示还在打卡中
  content: string;        // 这段时间做了什么
  rating: number;         // 1~5 星
  blocked: boolean;       // 屏蔽：不计入统计
  nodes: RecordNode[];
};
```

`end === null` 就是「正在打卡」——不用额外存一个运行状态，**用数据本身表达状态**，刷新页面也不会丢。

## 二、计时打卡：一个 useMemo + 一个 setInterval

「正在打卡的那条记录」直接从数据里算出来，不另存一份状态，避免两边不同步：

```ts
const running = useMemo(() => store.records.find(r => !r.end) || null, [store.records]);

useEffect(() => {
  if (!running) return;                       // 没在打卡就不要开定时器
  const id = setInterval(() => setTick(v => v + 1), 1000);
  return () => clearInterval(id);             // 关键：卸载/换状态时清掉
}, [running]);
```

结束打卡时只做一件事——补上 `end`，时长在读取时实时算：

```ts
function stopCheckin() {
  const end = new Date().toISOString();
  persist({ ...store, records: store.records.map(r => r.id === running.id ? { ...r, end } : r) });
}
```

## 三、月历热力图：把「投入时间」映射成颜色深浅

先把当月切成格子（周日开头），每格顺手算出当天总时长：

```ts
for (let day = 1; day <= daysInMonth; day += 1) {
  const key = `${year}-${pad(month + 1)}-${pad(day)}`;
  const minutes = store.records
    .filter(r => !r.blocked && dateKey(new Date(r.start)) === key)
    .reduce((sum, r) => sum + minutesOf(r), 0);
  cells.push({ key, day, minutes });
}
```

颜色就按阈值分档，一眼就能看出哪几天投入多：

```ts
export function intensityClass(minutes: number) {
  if (minutes <= 0)    return "bg-slate-900/5 dark:bg-white/5";
  if (minutes < 30)    return "bg-indigo-500/20";
  if (minutes < 60)    return "bg-indigo-500/35";
  if (minutes < 120)   return "bg-indigo-500/55";
  return "bg-indigo-500/75";
}
```

## 四、统计与连续打卡天数

「连续打卡」从今天往回数，如果今天还没打卡就从昨天开始数——这样白天打开页面不会显示成断签：

```ts
const days = new Set(active.map(r => dateKey(new Date(r.start))));
let streak = 0;
const cursor = new Date();
if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
while (days.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
```

## 五、备份：本地存储必须配一个出口

数据只存在浏览器里，换设备就没了，所以导出/导入是**必需功能**而不是加分项。导入用「合并」而不是覆盖，避免手滑把当天的记录冲掉：

```ts
const merged = {
  categories: [...store.categories, ...data.categories.filter(c => !store.categories.some(old => old.id === c.id))],
  records:    [...store.records,    ...data.records.filter(r => !store.records.some(old => old.id === r.id))],
};
```

## 六、踩过的坑与取舍

| 问题 | 处理方式 |
| --- | --- |
| 数据放哪儿？ | 站点是静态站，没有数据库；用 localStorage，并把备份导出做进界面 |
| 定时器泄漏 | 只在「正在打卡」时开 interval，并在 effect 返回里清理 |
| 记录误删 | 删除前一律 `confirm` 确认；被屏蔽的记录不参与统计但仍在列表里 |
| 分类删除 | 分类删掉后记录不删，只显示成「未分类」，避免连带丢数据 |
| 无障碍 | 分类按钮用 `aria-pressed`、月历格子带 `aria-label`（含当天时长）、番茄钟/统计用 `role="status"` |

## 小结

这个功能最能说明一件事：**能用「数据本身」表达的状态，就不要额外存一份状态**。整个页面没有复杂的全局状态，所有视图都是从 `records` 数组算出来的，所以改起来很轻——这也是我后面加「番茄钟联动桌宠」时能半小时接上的原因。