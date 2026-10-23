import type { NextConfig } from "next";

// Normal build (Vercel / local): keeps the server features (/api routes, on-demand image optimization)
// Static export build (GitHub Pages): STATIC_EXPORT=1, emits plain static files
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
    // A static export has no server, so on-demand optimization must be off or images 404
    unoptimized: isStaticExport,
  },
  // Type errors now fail the build instead of being skipped.
  typescript: { ignoreBuildErrors: false },
  ...(isStaticExport
    ? { output: "export" as const, basePath, assetPrefix: basePath || undefined, trailingSlash: true }
    : {}),
  // The packaged build I hand to the teacher to run locally: only the files needed to run, double-click to start
  ...(isStandalone && !isStaticExport ? { output: "standalone" as const } : {}),
};

export default nextConfig;
