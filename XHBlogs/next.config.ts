import type { NextConfig } from "next";

// 普通构建（Vercel / 本地）：保留服务端能力（/api 路由、图片按需优化）
// 静态导出构建（GitHub Pages）：STATIC_EXPORT=1，输出纯静态文件
const isStaticExport = process.env.STATIC_EXPORT === "1";
const isStandalone = process.env.STANDALONE_BUILD === "1";
const basePath = isStaticExport ? (process.env.NEXT_PUBLIC_BASE_PATH || "") : "";

const nextConfig: NextConfig = {
  compress: true,
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'bu.dusays.com' }],
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    // 静态导出没有服务端，必须关闭按需优化，否则图片 404
    unoptimized: isStaticExport,
  },
  typescript: { ignoreBuildErrors: true },
  ...(isStaticExport
    ? { output: "export" as const, basePath, assetPrefix: basePath || undefined, trailingSlash: true }
    : {}),
  // 打包给老师本地运行的版本：只带运行需要的文件，双击即可启动
  ...(isStandalone && !isStaticExport ? { output: "standalone" as const } : {}),
};

export default nextConfig;
