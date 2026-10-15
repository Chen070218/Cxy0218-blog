import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 🚨 核心修改 1：关掉纯静态导出，让 Vercel 帮你把 API 跑起来！
  // output: 'export',

  // 🚨 核心修改 2：Vercel 不需要强制加斜杠，关掉它能避免很多 API 路径匹配错误
  // trailingSlash: true,

  // 下面这些可以保留
    // 打开 Next 图片优化：服务端把原图转成合适尺寸的 WebP 再下发
  // （图床 bu.dusays.com 不支持按需缩图，900KB 的原图优化后通常只剩几十 KB）
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'bu.dusays.com' }],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略 TS 错误，方便快速部署
  },
};

export default nextConfig;