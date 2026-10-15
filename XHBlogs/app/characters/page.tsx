import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import CharacterGallery from "./CharacterGallery";
import { charactersData } from "../../data/characters";
import { siteConfig } from "../../siteConfig";

export const metadata: Metadata = {
  title: "角色图鉴 | " + siteConfig.title,
  description: "按看板角色「心月狐」的风格整理的同风格角色：鸣潮与原神里的银发、兽耳、传统服饰系角色。",
};

/** 在服务端先确认立绘文件是否存在，避免客户端出现"先裂图再变渐变卡"的闪烁 */
function withAvailability() {
  return charactersData.map((c) => {
    const filePath = path.join(process.cwd(), "public", c.image.replace(/^\//, ""));
    return { ...c, hasImage: fs.existsSync(filePath) };
  });
}

export default function CharactersPage() {
  const characters = withAvailability();

  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[92%] md:w-[90%] max-w-6xl mx-auto mt-24 md:mt-28">
          <header className="mb-8 md:mb-12">
            <p className="text-xs font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-300 uppercase">Character Gallery</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black text-slate-900 dark:text-white">角色图鉴</h1>
            <p className="mt-3 text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              按本站看板角色「心月狐」的风格——银白长发、兽耳、红白传统服饰——整理的一组同风格角色，
              来自《鸣潮》与《原神》。点卡片看详情，也可以按作品筛选。
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              想补充立绘：把图片放进 public/characters/ 并命名为 &lt;id&gt;.webp（id 见 data/characters.ts），刷新即可，无需改代码。
            </p>
          </header>
          <CharacterGallery characters={characters} />
        </main>
      </PageTransition>
    </div>
  );
}