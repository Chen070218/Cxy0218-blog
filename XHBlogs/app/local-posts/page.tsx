"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { readContent, LocalPost } from '../../components/ContentComposer';

// 已发布的文章（仓库里的 posts/）
const published = [
  { slug: 'blog-migration-notes', title: '把博客从 C 盘搬到 D 盘：一次环境迁移的踩坑记录' },
  { slug: 'linux-command-line', title: 'Linux 操作系统：我平时最常用的一批命令行操作' },
  { slug: 'algorithm-sorting', title: '算法与数据结构：排序算法到底怎么选' },
];

export default function LocalPostPage() {
  const [post, setPost] = useState<LocalPost | null>(null);
  const [notice, setNotice] = useState('正在读取归档…');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { setNotice(''); return; }
    readContent<LocalPost>('posts')
      .then((posts) => {
        const item = posts.find((p) => p.slug === id);
        if (item) setPost(item);
        else setNotice('这个归档不在当前浏览器里，可能是在别的设备上创建的，或者浏览器数据被清理了。');
      })
      .catch(() => setNotice('无法读取归档，请检查浏览器的存储设置。'));
  }, []);

  return (
    <>
      <Navbar />
      <main className="course-shell">
        <Link href="/timeline">← 返回归档</Link>

        {post ? (
          <article className="course-panel" style={{ marginTop: 20 }}>
            {post.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={post.cover} alt="归档封面" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 18 }} />
            ) : null}
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '24px 0' }}>{post.title}</h1>
            <p>{post.date} · {post.tags.join(' / ')}</p>
            <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.9, marginTop: 28 }}>{post.content}</div>
          </article>
        ) : (
          <section className="course-panel" style={{ marginTop: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 12px" }}>本地归档</h1>
            <p className="course-notice">
              这里显示的是<strong>在浏览器里创建的草稿</strong>，它们只存在当前设备，换电脑或清理浏览器数据后就看不到了。
              已发布到仓库的文章在下面，任何设备都能打开。
            </p>
            {notice ? <p role="status" className="course-notice">{notice}</p> : null}
            <ul style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              {published.map((item) => (
                <li key={item.slug}>
                  <Link href={`/posts/${item.slug}`}>📄 {item.title}</Link>
                </li>
              ))}
            </ul>
            <p className="course-notice" style={{ marginTop: 16 }}>
              也可以在 <Link href="/posts">文章列表</Link> 里看全部文章，或用首页的文章卡片进入。
            </p>
          </section>
        )}
      </main>
    </>
  );
}