import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cxy0218-blog.pages.dev').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: new URL(BASE).host,
  };
}
