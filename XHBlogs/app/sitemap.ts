import type { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig } from '../siteConfig';

export const dynamic = 'force-static';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cxy0218-blog.pages.dev').replace(/\/$/, '');

type Entry = { slug: string; date?: string };

function readEntries(dirName: string): Entry[] {
  const dir = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return { slug: file.replace(/\.md$/, ''), date: data.date ? String(data.date) : undefined };
    });
}

const absolute = (pathname: string) =>
  pathname === '/' ? `${BASE}/` : `${BASE}${pathname}/`;

const asDate = (value?: string) => {
  if (!value) return new Date();
  const parsed = new Date(value.replace(' ', 'T'));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/posts', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/build-log', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/timeline', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/chatter', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/photowall', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/moments', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/courses', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/checkin', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/music', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tree', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/friends', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/local-posts', priority: 0.4, changeFrequency: 'monthly' },
  ];

  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: absolute(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = readEntries('posts').map((post) => ({
    url: `${BASE}/posts/${post.slug}/`,
    lastModified: asDate(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const chatterEntries: MetadataRoute.Sitemap = readEntries('chatters').map((item) => ({
    url: `${BASE}/chatter/${item.slug}/`,
    lastModified: asDate(item.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...pages, ...postEntries, ...chatterEntries];
}
