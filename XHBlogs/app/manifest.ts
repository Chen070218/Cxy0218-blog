import type { MetadataRoute } from 'next';
import { siteConfig } from '../siteConfig';
import { withBasePath } from '../sitePath';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.authorName} — Personal Site & Study Workspace`,
    short_name: siteConfig.handle,
    description: siteConfig.bio,
    start_url: withBasePath('/'),
    scope: withBasePath('/'),
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    lang: 'en',
    icons: [
      { src: withBasePath('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBasePath('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
