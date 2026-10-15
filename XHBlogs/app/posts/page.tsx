import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { siteConfig } from "../../siteConfig";

export const metadata: Metadata = {
  title: "文章 | " + siteConfig.title,
  description: "全部文章，按时间倒序排列。",
};

type PostItem = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  cover: string;
  minutes: number;
};

function readPosts(): PostItem[] {
  const dir = path.join(process.cwd(), "posts");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const words = content.replace(/\s/g, "").length;
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title || file),
        date: String(data.date || ""),
        description: String(data.description || ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        cover: String(data.cover || siteConfig.defaultPostCover),
        minutes: Math.max(1, Math.round(words / 400)),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default function PostsIndexPage() {
  const posts = readPosts();

  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[92%] md:w-[90%] max-w-5xl mx-auto mt-24 md:mt-28">
          <header className="mb-8 md:mb-12">
            <p className="text-xs font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300 uppercase">All Posts</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black text-slate-900 dark:text-white">文章</h1>
            <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
              共 {posts.length} 篇，按时间倒序。文章用 Markdown 写在仓库的 posts/ 目录里。
            </p>
          </header>

          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="card-enter group flex flex-col sm:flex-row gap-0 sm:gap-6 overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-500"
              >
                <div className="relative w-full sm:w-56 h-40 sm:h-auto shrink-0 overflow-hidden bg-slate-200/60 dark:bg-slate-700/40">
                  <SmartImage fill sizes="(max-width: 640px) 100vw, 224px" src={post.cover} alt={post.title} className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5 md:p-6 flex flex-col justify-center min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <time dateTime={post.date}>{post.date}</time>
                    <span aria-hidden>·</span>
                    <span>约 {post.minutes} 分钟</span>
                  </div>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-2">{post.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {posts.length === 0 && (
              <p className="text-slate-600 dark:text-slate-300">posts/ 目录里还没有文章。</p>
            )}
          </div>
        </main>
      </PageTransition>
    </div>
  );
}