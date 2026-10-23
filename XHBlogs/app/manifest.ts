import type { MetadataRoute } from 'next';
import { siteConfig } from '../siteConfig';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.authorName} — Personal Site & Study Workspace`,
    short_name: siteConfig.handle,
    description: siteConfig.bio,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    lang: 'en',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
