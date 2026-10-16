---
title: "给博客养一只 AI 桌宠：九个动作状态 + 番茄钟联动 + 接入 DeepSeek"
date: "2026-10-16 11:30:00"
tags: ["React", "交互设计", "AI", "SVG"]
mood: "开心"
cover: "/screenshots/01-home.webp"
description: "从设定稿裁出 8 个 Q 版姿势、用状态机驱动动作、让宠物在番茄钟结束时开口提醒，再把对话接到 DeepSeek：一篇完整的桌宠实现记录。"
---

## 一、想要一只什么样的宠物

目标有三个：**会自己动**（不是一张贴图）、**能互动**（摸头/喂食/聊天）、**有实际用处**（番茄钟到点提醒我）。于是有了右下角这只 Q 版狐灵。

![首页右下角就是它](/screenshots/01-home.webp)

## 二、形象：从设定稿裁出 8 个姿势

形象不是画的，而是从设定稿里**抠出来的**：稿子中间那排有 8 个 Q 版姿势（待机/走动/开心/生气/睡觉/好奇/趴着/互动）。原图是浅灰底，白头发和背景灰度接近，直接按颜色抠会把头发挖空，所以改用**从四周漫水填充**的方式：只有与边缘连通的背景才透明，角色内部一律保留。

```python
# 用局部中值估计背景，再从边缘 flood fill
med = np.asarray(region.filter(ImageFilter.MedianFilter(size=31))).astype(np.int16)
diff = np.abs(np.asarray(region).astype(np.int16) - med).sum(2)
bg_like = diff < 22                       # 与局部背景足够接近
lab, _ = ndimage.label(bg_like)
border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
ink = ~np.isin(lab, list(border))         # 不是背景 = 角色
```

裁完每张 40~58KB，放进 `public/pet/`。

## 三、状态机：九个状态，两种驱动方式

状态类型先定好，然后所有动作都只是「换一个 state」：

```ts
export type PetState = "idle" | "walk" | "happy" | "angry" | "sleep"
                      | "curious" | "lie" | "think" | "interact";
```

驱动方式有两种，一是**没人理的时候自己动**：

```ts
useEffect(() => {
  if (isThinking || showInput || speech) return;      // 正在聊天/思考时不打扰
  const timer = setTimeout(() => {
    const pool: PetState[] = ['walk', 'curious', 'lie', 'idle', 'idle', 'sleep'];
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPetState(next);
    setTimeout(() => setPetState('idle'), next === 'sleep' ? 6000 : 4200);
  }, 9000 + Math.random() * 6000);
  return () => clearTimeout(timer);
}, [petState, isThinking, showInput, speech]);
```

二是**交互驱动**：摸头 → `happy`、发消息 → `think`、请求失败 → `angry`、打开输入框 → `interact`。

## 四、和番茄钟联动：用一个 window 事件解耦

番茄钟在工具箱里，桌宠在页面右下角，两者互不依赖。中间只靠一个自定义事件通信，谁都不用 import 谁：

```ts
// 番茄钟：阶段结束时广播
window.dispatchEvent(new CustomEvent("pet-say", {
  detail: { text: `专注结束啦，今天第 ${next} 个番茄完成～去休息 5 分钟吧 (๑•̀ㅂ•́)و✧`,
            state: "happy", ms: 6000 }
}));

// 桌宠：收到就说话 + 换表情
useEffect(() => {
  const onSay = (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    if (typeof d.text === "string") speak(d.text, d.ms || 6000);
    if (d.state) { setPetState(d.state); setTimeout(() => setPetState("idle"), d.ms || 6000); }
  };
  window.addEventListener("pet-say", onSay);
  return () => window.removeEventListener("pet-say", onSay);
}, []);
```

## 五、聊天接到 DeepSeek：一个路由，两个后端

`/api/chat` 同时支持 DeepSeek 和 Gemini，密钥只从环境变量读，绝不写进代码：

```ts
async function askDeepSeek(message: string, history: ChatMessage[]) {
  const key = (process.env.DEEPSEEK_API_KEY || "").trim();
  if (!key) throw new Error("NO_KEY_DEEPSEEK");
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: cfg.modelId,                                  // deepseek-chat
      messages: [{ role: "system", content: cfg.systemPrompt },
                 ...history.slice(-8),                     // 只带最近 8 条，控制成本
                 { role: "user", content: message }],
      temperature: cfg.temperature, max_tokens: cfg.maxOutputTokens,
    }),
  });
  ...
}
```

前端把最近 8 轮对话一起发过去，宠物才「记得住」刚才聊了什么；没配密钥时接口返回明确的提示，宠物会直接说出来，而不是静默失败。

## 六、让它有点「活人感」的细节

- **每天第一次打开打招呼**（`localStorage` 记一个日期，一天只打一次）
- **久坐 12 分钟提醒**：「已经坐很久啦，站起来舒展一下吧 (｡•́︿•̀｡)」
- **人格化文案 + 颜文字**：被摸时说「唔……准你摸一小会儿。( ˘ ³˘)♥」
- **尊重系统设置**：`prefers-reduced-motion` 打开时全部动画停掉

## 小结

桌宠看起来是「花活」，但它把好几块技术串起来了：**图像处理**（抠图）、**状态机**（动作驱动）、**事件解耦**（跨组件通信）、**服务端接口**（AI 对话）。如果只写一个静态图片，这个功能就白费了。