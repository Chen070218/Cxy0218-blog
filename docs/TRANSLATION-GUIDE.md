# English Rewrite Guide — cxy0218 site

This file is the single source of truth for the Chinese → English rewrite of the site in
`XHBlogs/`. Every agent working on the rewrite must follow it. If a term is missing from the
glossary, pick the most natural English wording, then add it here if it recurs.

## Goal

The site must read as if its author — a Computer Science student at Hainan Bielefeld University
of Applied Sciences — wrote it in English. It is the final project of a web course, so the English
has to be natural, specific, and free of marketing/AI filler. Preserve every concrete fact,
number, command, file name and technical detail; never invent content and never soften a
technical claim.

## Non-negotiable rules

1. **No Chinese characters may remain** in any file you own — not in visible text, `alt`, `title`,
   `aria-label`, `placeholder`, form help text, comments, `metadata`, or Markdown frontmatter
   values. Grep your own files before reporting (`[\u4e00-\u9fff]`).
2. **Do not change behaviour.** Do not rename variables, components, props, routes, keys,
   localStorage keys, API fields, CSS classes, ids, imports, regexes or data shapes. Translate
   human-readable values only.
3. **Do not change structure.** Keep JSX nesting, formatting style, indentation, and Markdown
   structure. Do not add, remove or reorder sections, buttons or links.
4. **Do not touch files outside your assignment.** Another agent owns them; a conflicting edit
   will be rejected. If a file you need is out of scope, report it instead of editing it.
5. **Never run `next build`, `next dev`, `npm install`, `git commit` or deploy commands.** The
   Lead runs builds, tests and commits. The dev server is already running on port 4323.
6. Preserve emoji, image paths, URLs, code fences, inline code, KaTeX math and HTML entities.
7. Keep Markdown frontmatter **keys** (`title`, `description`, `date`, `cover`, `tags`, `mood`,
   `location`, `id`, `images`) and translate their **values** only. Keep `date`, `id`, `cover`,
   `images` values exactly as-is.
8. In TypeScript, prefer double quotes or typographic `’` when a string contains an apostrophe,
   so you never break quoting. Do not use full-width punctuation in English text.
9. Keep UI labels short — English is ~1.6× longer than Chinese. For buttons, tabs and nav use the
   short forms in the glossary (e.g. "Check-in", not "Time-block check-in record").

## Voice

- First person, plain and concrete, like a student explaining their own work to a classmate.
- Technical and specific: name the tool, the file, the number, the error.
- No "Welcome to my website", no "delve", no "seamless", no "unlock", no hype adjectives.
- The desktop pet (Xinyuehu) keeps her slightly haughty, elegant, secretly-caring voice.
- British spelling is fine but be consistent inside a file; prefer `colour`? **No — use American
  spelling** (`color`, `behavior`, `organize`) to match the existing code identifiers.

## Glossary

### Identity

| Chinese | English |
| --- | --- |
| cxy0218 | cxy0218 (never translate) |
| 陈向阳 | Chen Xiangyang |
| 心月狐 | **Xinyuehu** (first mention: "Xinyuehu, the Moon Fox"; later "the fox" / "she") |
| 本座 | "this fox" (the pet's proud self-reference) |
| 人类 / 主人 | "human" / "my master" |
| 鸣潮 | Wuthering Waves |
| 今州 | Jinzhou |
| 索拉里斯 | Solaris |
| 声骸 | Echo (Wuthering Waves term) |
| 海南比勒费尔德应用科学大学 | Hainan Bielefeld University of Applied Sciences |
| 计算机科学 | Computer Science |
| 2025 级 | 2025 intake |
| 德语 / 英语 | German / English |

### Navigation and page names

| Route | Nav label | Page title / heading |
| --- | --- | --- |
| `/` | Home | Home |
| `/projects` | Projects | Projects |
| `/tree` | Creative Workshop | Creative Workshop |
| `/posts` | Posts | Posts |
| `/chatter` | Musings | Musings |
| `/timeline` | Timeline | Timeline |
| `/local-posts` | Local Drafts | Local Drafts |
| `/courses` | Courses | Courses & Timetable |
| `/resources` | Resources | Resources |
| `/photowall` | Photo Wall | Photo Wall |
| `/moments` | Moments | Moments |
| `/music` | Music | Music |
| `/checkin` | Check-in | Check-in |
| `/about` | About Me | About Me |
| `/friends` | Friends | Friends |
| `/build-log` | Build Log | Build Log (new page, Lead owns) |

Nav grouping (Lead is rebuilding `components/Navbar.tsx`): Home · Projects (Projects, Creative
Workshop) · Writing (Posts, Musings, Timeline, Local Drafts) · Study (Courses, Resources) ·
Life (Photo Wall, Moments, Music, Check-in) · About (About Me, Build Log, Friends).

### Recurring UI terms

| Chinese | English |
| --- | --- |
| 首页 | Home |
| 文章 | posts |
| 最新一篇 | Latest post |
| 最新文章 / 文章列表 | Latest posts / All posts |
| 说说 | moments |
| 杂谈 | musings |
| 归档 | timeline / archive |
| 照片墙 | photo wall |
| 相册 | album |
| 打卡 | check-in |
| 时间段打卡 | time-block check-in |
| 月度记录 | monthly log |
| 课程表 / 课程周历 | weekly timetable |
| 学习资料 | Resources |
| 讲义 | lecture notes |
| 常用网站 | useful websites |
| 项目 | projects |
| 关于 | About |
| 友链 | friend links |
| 创意工坊 | Creative Workshop |
| 夜间模式 | Night mode |
| 白天模式 | Day mode |
| 主题 | theme |
| 开机动画 | splash screen |
| 深空 / 流萤 | deep space / fireflies |
| 弹幕 | danmaku |
| 桌宠 | desktop pet |
| 番茄钟 | Pomodoro timer |
| 久坐提醒 | stand-up reminder |
| 天气 | weather |
| 搜索标题、描述或标签… | Search titles, descriptions or tags… |
| 暂无内容 / 还没有 | Nothing here yet |
| 加载中… | Loading… |
| 返回 | Back |
| 目录 | On this page |
| 评论 | Comments |
| 导出 / 导入 | Export / Import |
| 开始 / 结束 | Start / Stop |
| 保存 / 取消 / 删除 | Save / Cancel / Delete |
| 编辑 | Edit |
| 时长 | duration |
| 分类 | category |
| 备注 | note |
| 评分 | rating |
| 累计 / 连续 | total / streak |
| 系统已稳定运行 | System uptime |
| 计算器 | Calculator |
| 音乐 | music |
| 播放 / 暂停 | Play / Pause |
| 歌词 | lyrics |
| 上传 | upload |
| 浏览 | browse |
| 拖拽 | drag |
| 关闭 | Close |
| 菜单 | menu |
| 导航 | navigation |

### Study / course context

| Chinese | English |
| --- | --- |
| 编程 I / II | Programming I / II |
| 算法与数据结构 | Algorithms and Data Structures |
| 操作系统 | Operating Systems |
| 数学 I / II | Mathematics I / II |
| 人工智能基础 | Foundations of Artificial Intelligence |
| 职业技术导论 | Introduction to Professional Practice |
| 项目工作导论 | Introduction to Project Work |
| 科研工作导论 | Introduction to Research Work |
| 德语课 / 英语课 | German class / English class |
| 学分 | credits |
| 教室 | room |
| 教师 | lecturer |
| 上午 / 下午 | AM / PM |
| 周一 … 周日 | Monday … Sunday |
| 周一至周五 | Monday to Friday |
| 学期 | semester |
| 作业 | assignment |
| 考试 | exam |
| 广东省 深圳市 宝安区 | Bao'an District, Shenzhen, Guangdong |

### Technical vocabulary

| Chinese | English |
| --- | --- |
| 前端 / 后端 | frontend / backend |
| 静态导出 | static export |
| 部署 | deploy / deployment |
| 打包 | package |
| 服务端 | server side |
| 接口 | API |
| 密钥 | API key |
| 环境变量 | environment variable |
| 浏览器本地存储 | browser local storage |
| 响应式 | responsive layout |
| 可访问性 | accessibility |
| 语义化 | semantic markup |
| 性能 | performance |
| 首屏 | first paint |
| 白屏 | blank screen |
| 图片懒加载 | lazy-loaded images |
| 组件 | component |
| 路由 | route |
| 正文 | body text |
| 封面 | cover |
| 标签 | tags |

## Canonical content titles

These exact strings must be used wherever the item is referenced (post page, list pages, cards).

Posts:

1. `posts/frontend-performance.md` — **"The site stuttered twice, so I traced it twice"** —
   "Slow first paint on my phone, janky page transitions, images popping in one by one — and how
   I tracked each problem down." Tags: Performance / Images / CSS.
2. `posts/ai-desktop-pet.md` — **"The fox in the corner: from cut-out sprite to conversation
   partner"** — "Cutting out sprites, a state machine, Pomodoro hooks, a DeepSeek connection — and
   a few details I reworked more than once." Tags: React / Interaction / AI.
3. `posts/blog-migration-notes.md` — **"Another computer, same blog: moving the site from C: to
   D:"** — "How I got it running on a machine without Node — and the three places it got stuck."
   Tags: Next.js / Environment / Troubleshooting.
4. `posts/algorithm-sorting.md` — **"Sorting algorithms: choosing one, after writing them all"** —
   "I implemented bubble, insertion, merge, quicksort and heapsort, hit a few traps, and ended up
   with a comparison table." Tags: Algorithms / Data structures / Complexity.
5. `posts/linux-command-line.md` — **"After the OS lab: the commands I actually type"** — "Lab
   sessions mean commands I cannot remember, so I look them up. These are the ones I use most, and
   a few I got burned by." Tags: Linux / Operating Systems / Command line.
6. `posts/checkin-feature.md` — **"The check-in page: finding out where the hours really went"** —
   "Things I reworked several times while building it: the data model, the timer, the calendar
   colours, and export/backup." Tags: Next.js / Frontend / Time management.

Chatter:

- `chatters/2026-09-28-moonfox-design-note.md` — **"Why Xinyuehu?"** — "I went back and forth on
  the character for a long time. This is the one I picked." Tags: Wuthering Waves / Desktop pet.
  Mood: Focused.

Moments: translate freely, keep the casual diary tone. Locations:
"Bao'an District, Shenzhen, Guangdong". Moods: 开心 = Happy, 专注 = Focused, 解压 = Relieved.

Albums (`data/albums.ts`):

- "索拉里斯漫行" → **"A Walk Through Solaris"** — "A walk through the world of Wuthering Waves:
  rain in Jinzhou, wind over the wilds, and the echoes of the old world." Captions: 今州的夜色 →
  "Nightfall in Jinzhou"; 残响之上的星空 → "A sky above the echoes".
- "声骸随拍" → **"Echo Snapshots"** — "Fragments from the road: a Resonator's silhouette, a
  lighthouse on the plains, and the Echoes collected along the way." Captions: 旷野上的黄昏 →
  "Dusk on the plains"; 旧城的窄巷 → "An alley in the old city"; 抬头就是星海 → "Look up: a sea
  of stars".

Projects (`data/projects.ts`): keep project name "Computational Chemistry Tool"; description →
"This is a set of scripts I use on WSL2 (Ubuntu 22) under Windows. It only wires a few existing
steps together, so adapt the data to your own case." Tags keep Gromacs / RMSF.

Friends (`data/friends.ts`): "鸣潮 · 索拉里斯档案" → **"Wuthering Waves — Solaris Archive"** —
"Resonators, Echoes and notes on Jinzhou. My go-to reference."

Resource categories: 前端 Frontend, 编程 Programming, 算法 Algorithms, 操作系统 Operating Systems,
工具 Tools, 德语 German, 英语 English, 课程 Courses, 数学 Mathematics. Keep resource URLs and ids;
translate titles and notes truthfully (e.g. "MDN Web Docs", "Python Tutorial (official)"). Where
the linked site is the Chinese edition, say so — do not pretend it is English.

## Dates, numbers, formats

- Dates in prose → `Oct 16, 2026`. In code, build them from month abbreviations
  (`Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec`) or keep the numeric `2026.10.16` style used
  by the existing formatter — but never `2026年10月16日`.
- Weekdays in the timetable → `Mon Tue Wed Thu Fri Sat Sun`.
- Durations: "31 days 21 hours" → `31d 21h`; timer values → `25:00`.
- Counters: "6 篇文章" → `6 posts`; "3 条说说" → `3 moments`; "5 张照片" → `5 photos`.

## Self-check before reporting

Run this over only your own files (PowerShell or grep):

```
grep -nP "[\x{4e00}-\x{9fff}]" <file1> <file2> ...
```

Expected: no output. Then check that the files still parse: the Lead will run the build, but you
can sanity-check balanced quotes/braces by eye or with `node --check` on `.ts` files (not `.tsx`).

Report back: (1) files changed, (2) any string you deliberately left in Chinese and why (should be
none), (3) any cross-file dependency you noticed that another agent must honour.
