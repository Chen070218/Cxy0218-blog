---
title: "把 900KB 的图片压到 50KB：一次前端性能优化的完整复盘"
date: "2026-10-16 14:00:00"
tags: ["性能优化", "图片优化", "CSS", "Next.js"]
mood: "解压"
cover: "/screenshots/04-photowall.webp"
description: "从「切页卡、图片一张张卡出来、手机打开长时间白屏」到流畅：这篇把定位过程、每一项改动背后的原理和实测数据都记录下来。"
---

## 一、症状与定位

问题有三个表现：**切换页面卡顿**、**图片一张张「卡」出来**、**手机打开长时间白屏**。逐个查：

- 数了一遍常驻动画元素：草的 **150** 根 + 萤火虫 **50** 只 + 樱花 **40** 片 + 弹幕 15 条 ≈ **255 个无限循环动画**；
- 抽查图片传输体积：图床上的照片单张 **903KB**（最大 945KB），而且服务器**不支持按需缩图**（试过阿里 OSS / 七牛 / 又拍云几种参数，返回的都是原图）；
- 看 CSS 发现整页内容被藏起来了：`#app-mount-root { opacity: 0; visibility: hidden }`，必须等 JS 跑完 + 开机动画结束才显示 ✗ 手机上就是白屏。

![照片墙：现在每张图只有几十 KB](/screenshots/04-photowall.webp)

## 二、图片：让服务端按尺寸转 WebP

图床不给缩图，就把优化放到自己这边——开启 Next 的图片优化（服务端下载原图 → 转 WebP → 按显示尺寸下发）：

```ts
// next.config.ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'bu.dusays.com' }],
  formats: ['image/webp'],
  minimumCacheTTL: 2678400,   // 原图很少变，缓存 31 天
},
```

再包一个 `SmartImage`：**白名单主机走优化，其它任意图床退回原生 `<img>`**，这样既拿到优化，又不会因为域名没配置而整页报错：

```tsx
const ALLOWED_REMOTE_HOSTS = ['bu.dusays.com'];
export default function SmartImage({ src, fill, sizes, ...rest }: SmartImageProps) {
  const canOptimize = !/^https?:\/\//i.test(src) || ALLOWED_REMOTE_HOSTS.includes(new URL(src).hostname);
  if (!canOptimize) return <img src={src} className={rest.className} loading="lazy" decoding="async" />;
  return fill ? <Image {...rest} src={src} fill sizes={sizes} /> : <Image {...rest} src={src} />;
}
```

**实测：同一张图 903KB → 49KB / 66KB / 81KB**（不同显示尺寸），再配合 `loading="lazy"` + `decoding="async"`，首屏不再抢带宽。

## 三、动画：只动 transform / opacity，数量砍到 1/4

浏览器里最便宜的是**合成层动画**（transform / opacity），最贵的是**触发重排重绘**的属性。于是：

- 粒子数量砍下来：草 `150 → 40`、萤火虫 `50 → 18`、樱花 `40 → 20`；
- 萤火虫原来在**动画里改 `box-shadow`**（每帧重绘）→ 改成静态光晕 + 只动 `opacity/transform`；
- 弹幕原来动的是 `right`（布局属性，每帧重排）→ 改成 `transform: translate3d()`：

```css
@keyframes danmaku-move {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(calc(-100vw - 100%), 0, 0); }
}
```

## 四、按需运行：把「永远在跑」的东西停下来

点击涟漪原来有一个**永不停止的 `requestAnimationFrame`**：即使没有任何涟漪，也在每帧清空整屏 canvas。改成「点击才启动、扩散完就停」：

```ts
const frame = () => {
  rafId = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  /* …画涟漪… */
  if (ripples.length > 0) rafId = requestAnimationFrame(frame);   // 还有才继续
};
const handleClick = (e) => {
  ripples.push(new Ripple(e.clientX, e.clientY));
  if (rafId === null) rafId = requestAnimationFrame(frame);       // 没在跑才启动
};
```

同时**标签页切到后台就暂停所有特效**（`visibilitychange`），不再白烧 CPU。

## 五、切页：从「JS 逐帧改样式」换成纯 CSS

页面进入动画原来用 framer-motion 在 JS 里逐帧改整页的 `opacity/y`，而页面里又有大量 `backdrop-blur` 玻璃卡片——淡入时模糊层要跟着逐帧重算，点快了多个动画就叠在一起。改成纯 CSS 动画 + **快速切页时直接跳过动画**：

```tsx
let lastNavigationAt = 0;
export default function PageTransition({ children }: { children: ReactNode }) {
  const shouldAnimate = useMemo(() => {
    const now = Date.now();
    const isRapid = now - lastNavigationAt < 600;   // 600ms 内连续切页 = 用户在快速翻页
    lastNavigationAt = now;
    return !isRapid;
  }, []);
  return <div className={shouldAnimate ? "page-enter" : undefined}>{children}</div>;
}
```

## 六、白屏：内容不该等 JS

这是最要命的一条：整页内容被 CSS 隐藏，必须等 JS 激活并跑完开机动画才显示，JS 失败就永远白屏。改法是**内容始终可见**，开机动画只作为一层覆盖层，并把动画从 2.2s 缩到 1.2s。

## 七、字体：不再依赖 Google

原来三个字体都从 Google 取，构建时必须联网（这也是本地构建一直失败的原因），中文衬线字还要拉好几 MB。改成自托管：Geist 走 npm 包，中文用思源宋体可变版（101 个 unicode-range 分片，浏览器只下用到的字）。

## 八、结果

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 图床单张照片 | 903 KB | 49–81 KB |
| 常驻动画元素 | ~255 个 | ~78 个 |
| 滚动式粒子特效 | 每帧重绘 `box-shadow` | 只动 transform/opacity |
| 点击涟漪 | 常驻 rAF 循环 | 按需运行 |
| 切页动画 | JS 逐帧 0.8s | 纯 CSS 0.32s，快切跳过 |
| 首屏可见时间 | 等 JS + 动画（数秒白屏） | 立即渲染 |
| 本地构建 | 需要访问 Google 字体 | 完全离线 |

## 小结

这次优化没有一处是「玄学调参」：**先量（数元素、看体积、读 CSS），再改，最后回到同一张表上验证**。也让我记住两件事：图床不给缩图就自己在服务端转；以及「动 `right/top/width` 的动画」和「永远在跑的 rAF」是前端卡顿的两大常客。