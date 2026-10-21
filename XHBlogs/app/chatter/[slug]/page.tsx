import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { prefixHtml } from "../../../sitePath";
import { formatDate } from "../../../components/formatDate";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/atom-one-dark.css";
import Navbar from "../../../components/Navbar";
import PageTransition from "../../../components/PageTransition";
import SmartImage from "../../../components/SmartImage";
import { siteConfig } from "../../../siteConfig";

const chatterDir = () => path.join(process.cwd(), "chatters");

export async function generateStaticParams() {
  const dir = chatterDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

async function getChatter(slug: string) {
  const file = path.join(chatterDir(), `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight, { detect: true })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    title: String(data.title || slug),
    date: String(data.date || ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    mood: data.mood ? String(data.mood) : "",
    cover: String(data.cover || siteConfig.defaultPostCover),
    contentHtml: processed.toString(),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getChatter(slug);
  if (!item) return { title: `Musings | ${siteConfig.title}` };
  return {
    title: `${item.title} | ${siteConfig.title}`,
    description: `${item.title} — a short note by ${siteConfig.authorName}.`,
  };
}

export default async function ChatterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getChatter(slug);
  if (!item) notFound();

  return (
    <div className="min-h-screen relative pb-24">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="w-[92%] md:w-[90%] max-w-3xl mx-auto mt-24 md:mt-28">
          <Link href="/chatter" className="text-sm font-bold text-indigo-600 dark:text-indigo-300">← Back to Musings</Link>
          <article className="mt-4 rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="relative w-full aspect-[16/9] bg-slate-200/50 dark:bg-slate-700/40">
              <SmartImage fill sizes="(max-width: 768px) 100vw, 760px" src={item.cover} alt={item.title} className="object-cover" />
            </div>
            <div className="p-6 md:p-10">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">{item.title}</h1>
              <p className="mt-2 text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400">
                {formatDate(item.date, true)}
                {item.mood ? ` · ${item.mood}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none mt-6" dangerouslySetInnerHTML={{ __html: prefixHtml(item.contentHtml) }} />
            </div>
          </article>
        </main>
      </PageTransition>
    </div>
  );
}
