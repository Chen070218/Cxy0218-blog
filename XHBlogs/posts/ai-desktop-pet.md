---
title: "右下角那只狐狸：桌宠从抠图到能聊天"
date: "2026-10-16 11:30:00"
tags: ["React", "交互", "AI"]
mood: "开心"
cover: "/screenshots/01-home.webp"
description: "抠图、状态机、番茄钟联动、接 DeepSeek，以及几个我自己改了好几遍的细节。"
---

一开始只是想让页面右下角有点活的东西。翻了设定稿，选了《鸣潮》里的心月狐——月亮、星辉、狐狸，跟站点的色调也搭。但如果只贴一张图，过两天就没人看了，所以我给它加了三件事：会自己动、点它会有反应、到点会提醒我休息。

![首页右下角这只就是它](/screenshots/01-home.webp)

## 抠图比想象中难

设定稿上有八个小姿势，我裁下来逐个抠成透明 PNG。第一版按颜色抠，结果白头发被挖空了——底色是浅灰，跟白头发灰度太接近，颜色一筛就一起没了。

后来换了个思路：从图片的上下左右四条边往里做"漫水填充"，只有跟边缘连着的浅色区域才算背景，角色内部的白色一律保留。

```python
med = np.asarray(region.filter(ImageFilter.MedianFilter(size=31))).astype(np.int16)
diff = np.abs(np.asarray(region).astype(np.int16) - med).sum(2)
bg_like = diff < 22
lab, _ = ndimage.label(bg_like)
border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
ink = ~np.isin(lab, list(border))     # 不是背景 = 角色
```

抠完每张 40KB 到 58KB，放在 `public/pet/` 下面，空闲时间一次性预加载，切换动作时才不会闪一下白。

## 九个状态

待机、走动、开心、生气、睡觉、好奇、趴着、思考、互动。所有行为最后都只是"换一个 state"，所以状态机本身不复杂。

麻烦的是它得"看起来在自己活"。没人理的时候会随机走两步或者打个盹，但我发现聊天时它还在旁边晃来晃去很出戏，于是加了几个判断：

```ts
useEffect(() => {
  if (isThinking || showInput || speech) return;   // 正在聊天就别乱动
  const timer = setTimeout(() => {
    const pool = ['walk', 'curious', 'lie', 'idle', 'idle', 'sleep'];
    const next = pool[Math.floor(Math.random() * pool.length)];
    setPetState(next);
    setTimeout(() => setPetState('idle'), next === 'sleep' ? 6000 : 4200);
  }, 9000 + Math.random() * 6000);
  return () => clearTimeout(timer);
}, [petState, isThinking, showInput, speech]);
```

摸头是开心，发消息是思考，请求失败就生气，点开发言框是互动。这几个都是我自己试出来的，不然它看起来像个贴图。

## 和番茄钟怎么连

番茄钟在工具箱里，桌宠在页面右下角，两个组件互不相识。我一开始想让番茄钟直接调用桌宠的方法，写起来很别扭——要层层传 props，还容易循环依赖。

最后用了一个 window 自定义事件当中间人：

```ts
// 番茄钟：一个阶段结束时广播
window.dispatchEvent(new CustomEvent("pet-say", {
  detail: { text: "专注结束啦，去休息 5 分钟吧", state: "happy", ms: 6000 }
}));
```

桌宠只监听 `pet-say`，谁发的它不用知道。以后再加别的功能（比如打卡结束也让它说一句），也只要发同一个事件。

## 聊天接了 DeepSeek

对话走 `/api/chat`，密钥只放在环境变量里，代码里不出现。前端会把最近 8 轮一起发过去，不然它记不住上一句说了什么。

没配密钥的时候接口会明确返回"还没有配置"，宠物会把这句说出来，而不是转圈半天没反应——这个提示是我在 Cloudflare 上部署完才补的，因为静态托管和带服务端的版本行为不一样。

## 几个小地方

每天第一次打开会打个招呼，用 localStorage 记日期，一天只打一次。坐太久（12 分钟没动）会提醒我站起来。系统开了"减少动态效果"时，所有动画都会停掉。

现在还有一点不满意：走路的频率有点快，看着像在赶作业。等有空把帧率调慢一点。
