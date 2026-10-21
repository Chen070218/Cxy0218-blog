"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { readContent, LocalPost } from '../../components/ContentComposer';
import { withBasePath } from '../../sitePath';
import { formatDate } from '../../components/formatDate';

// Published posts (posts/ in the repo)
const published = [
  { slug: 'blog-migration-notes', title: 'Another computer, same blog: moving the site from C: to D:' },
  { slug: 'linux-command-line', title: 'After the OS lab: the commands I actually type' },
  { slug: 'algorithm-sorting', title: 'Sorting algorithms: choosing one, after writing them all' },
];

export default function LocalPostPage() {
  const [post, setPost] = useState<LocalPost | null>(null);
  const [notice, setNotice] = useState('Loading the draft…');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { setNotice(''); return; }
    readContent<LocalPost>('posts')
      .then((posts) => {
        const item = posts.find((p) => p.slug === id);
        if (item) setPost(item);
        else setNotice('This draft is not in this browser. It may have been created on another device, or the browser data was cleared.');
      })
      .catch(() => setNotice('Could not read the draft. Check your browser storage settings.'));
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content" className="course-shell">
        <Link href="/timeline">← Back to Timeline</Link>

        {post ? (
          <article className="course-panel" style={{ marginTop: 20 }}>
            {post.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={withBasePath(post.cover)} alt="Draft cover" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 18 }} />
            ) : null}
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: '24px 0' }}>{post.title}</h1>
            <p>{formatDate(post.date, true)} · {post.tags.join(' / ')}</p>
            <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.9, marginTop: 28 }}>{post.content}</div>
          </article>
        ) : (
          <section className="course-panel" style={{ marginTop: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 12px" }}>Local Drafts</h1>
            <p className="course-notice">
              This page shows <strong>drafts created in your browser</strong>. They only exist on this device; switch
              computers or clear your browser data and they are gone. Published posts live in the repository and are
              listed below — they open on any device.
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
              You can also browse every post in <Link href="/posts">All posts</Link>, or come in from the post cards on the home page.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
