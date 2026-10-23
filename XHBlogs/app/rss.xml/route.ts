import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig } from '../../siteConfig';

export const dynamic = 'force-static';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cxy0218-blog.pages.dev').replace(/\/$/, '');

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

type Post = { slug: string; title: string; description: string; date: string };

function readPosts(): Post[] {
  const dir = path.join(process.cwd(), 'posts');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return {
        slug: file.replace(/\.md$/, ''),
        title: String(data.title || file),
        description: String(data.description || ''),
        date: String(data.date || ''),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

const toRfc822 = (value: string) => {
  const date = value ? new Date(value.replace(' ', 'T')) : new Date();
  return (Number.isNaN(date.getTime()) ? new Date() : date).toUTCString();
};

export async function GET() {
  const posts = readPosts();
  const items = posts
    .map((post) => {
      const url = `${BASE}/posts/${post.slug}/`;
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const latest = posts[0] ? toRfc822(posts[0].date) : new Date().toUTCString();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(`${siteConfig.authorName} — Posts`)}</title>`,
    `    <link>${BASE}/posts/</link>`,
    '    <description>Study notes, debugging diaries and write-ups by Chen Xiangyang.</description>',
    '    <language>en</language>',
    `    <lastBuildDate>${latest}</lastBuildDate>`,
    `    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
