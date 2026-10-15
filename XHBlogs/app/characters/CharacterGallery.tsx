"use client";

import { useEffect, useMemo, useState } from "react";
import { GameCharacter } from "../../data/characters";
import { siteConfig } from "../../siteConfig";
import { siteConfig } from "../../siteConfig";

const WORKS = ['全部', '鸣潮', '原神'] as const;

/** 图片加载失败时退化成渐变色卡片，而不是显示裂图 */
function CardArt({ character, className }: { character: CharacterWithImage; className?: string }) {
  const [failed, setFailed] = useState(!character.hasImage);
  const [c1, c2] = character.accent;

  if (failed) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center text-center gap-2`}
        style={{ background: `linear-gradient(140deg, ${c1}, ${c2})` }}
        aria-hidden
      >
        <span className="text-3xl font-black text-white/95 drop-shadow-lg">{character.name}</span>
        <span className="text-xs font-bold tracking-widest text-white/80">{character.work} · {character.element}</span>
      </div>
    );
  }

  return (
    <img
      src={character.image}
      alt={character.name + " 立绘"}
      onError={() => setFailed(true)}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

export type CharacterWithImage = GameCharacter & { hasImage: boolean };

export default function CharacterGallery({ characters }: { characters: CharacterWithImage[] }) {
  const [work, setWork] = useState<(typeof WORKS)[number]>('全部');
  const [selected, setSelected] = useState<CharacterWithImage | null>(null);

  const all = characters;
  const list = useMemo(
    () => (work === '全部' ? all : all.filter((c) => c.work === work)),
    [work]
  );

  // Esc 关闭弹窗
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="按作品筛选">
        {WORKS.map((w) => {
          const count = w === '全部' ? all.length : all.filter((c) => c.work === w).length;
          const active = work === w;
          return (
            <button
              key={w}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setWork(w)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all duration-300 ${
                active
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/30'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-white/50 dark:border-white/10 hover:bg-white/85 dark:hover:bg-slate-700/70'
              }`}
            >
              {w}
              <span className="ml-1.5 text-[11px] opacity-75">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((c) => (
        <button
          type="button"
          key={c.id}
          onClick={() => setSelected(c)}
          className="card-enter text-left rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/60"
        >
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-200/60 to-slate-300/40 dark:from-slate-700/50 dark:to-slate-800/50">
            <CardArt character={c} className="w-full h-full object-cover object-top" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black text-white bg-slate-900/60 backdrop-blur-md">
              {c.work}
            </span>
            <span className="absolute bottom-0 inset-x-0 px-4 py-3 bg-gradient-to-t from-slate-950/85 to-transparent text-white">
              <span className="block text-lg font-black">{c.name}</span>
              <span className="block text-[11px] tracking-widest opacity-85">{c.element}</span>
            </span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-1.5">
              {c.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </button>
      ))}

      {selected && (
        <div
          className="fixed inset-0 z-[9998] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.name + ' 详情'}
            onClick={(e) => e.stopPropagation()}
            className="card-enter w-full max-w-3xl max-h-[86vh] overflow-y-auto rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-white/40 dark:border-white/10 shadow-2xl"
          >
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] overflow-hidden bg-gradient-to-br from-slate-200/60 to-slate-300/40 dark:from-slate-700/50 dark:to-slate-800/50">
              <CardArt character={selected} className="w-full h-full object-cover object-top" />
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="关闭"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/50 text-white text-lg leading-none hover:bg-slate-950/75 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selected.name}</h2>
              <p className="mt-1 text-xs font-bold tracking-widest text-indigo-600 dark:text-indigo-300">
                {selected.work} · {selected.element}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{selected.description}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {selected.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                角色名称与形象版权归原作者 / 游戏厂商所有，本站仅作个人学习作品中的界面演示，非商业用途。
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
