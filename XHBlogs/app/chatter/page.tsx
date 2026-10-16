import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import ChatterBoard from "./ChatterBoard";
import { siteConfig } from "../../siteConfig";

export const metadata = {
  title: "杂谈 | " + siteConfig.title,
  description: "非正式的文章与脑洞记录。",
};

function readChatters() {
  const dir = path.join(process.cwd(), "chatters");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: String(data.title || file),
        date: String(data.date || ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        mood: data.mood ? String(data.mood) : "",
        cover: String(data.cover || siteConfig.defaultPostCover),
        content,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default function ChatterPage() {
  const chatters = readChatters();

  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[92%] md:w-[90%] max-w-6xl mx-auto mt-24 md:mt-28">
          <header className="mb-8 md:mb-10">
            <p className="text-xs font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300 uppercase">Chatter</p>
            <h2 className="mt-2 text-3xl md:text-5xl font-black text-slate-900 dark:text-white">杂谈</h2>
            <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
              非正式的文章与脑洞记录，共 {chatters.length} 篇。
            </p>
          </header>
          <ChatterBoard chatters={chatters} />
        </main>
      </PageTransition>
    </div>
  );
}
