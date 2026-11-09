"use client";

import { useEffect, useState } from "react";
import { MapPin, X, ChevronLeft, ChevronRight } from "lucide-react";
import { withBasePath } from "../../sitePath";
import { formatDate } from "../../components/formatDate";

type Moment = {
  id: string;
  date: string;
  location?: string;
  images?: string[];
  content: string;
};

function ImageGrid({ images, onOpen }: { images: string[]; onOpen: (index: number) => void }) {
  if (!images.length) return null;
  const count = images.length;
  const columns = count === 1 ? 1 : count === 4 ? 2 : 3;

  return (
    <div
      className="mt-3 grid gap-[3px] overflow-hidden rounded-[3px]"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {images.slice(0, 9).map((src, index) => {
        const last = index === 8 && count > 9;
        return (
          <button
            key={src + index}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`Open photo ${index + 1} of ${count}`}
            className={`group relative overflow-hidden bg-black/5 ${count === 1 ? "aspect-[4/3] max-h-[380px]" : "aspect-square"}`}
          >
            <img
              src={withBasePath(src)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {last && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xl font-bold text-white">
                +{count - 9}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function MomentList({ moments, authorName, avatarUrl, avatarAlt }: any) {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const sorted: Moment[] = [...(moments || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") {
        setLightbox((current) =>
          current ? { ...current, index: (current.index + 1) % current.images.length } : current,
        );
      }
      if (event.key === "ArrowLeft") {
        setLightbox((current) =>
          current
            ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
            : current,
        );
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <div className="mx-auto mt-24 w-[92%] max-w-[680px] pb-20 md:mt-28 md:w-[90%]">
      <header className="mb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-300">
          朋友圈 · travel notes
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
          Moments
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Trips, small days and the photos I did not want to lose.
        </p>
      </header>

      <div className="overflow-hidden rounded-[6px] bg-[#f7f7f7] text-[#1f1f1f] shadow-2xl">
        {sorted.map((moment, index) => (
          <article
            key={moment.id}
            className={`flex gap-3 px-4 py-5 md:gap-4 md:px-6 ${index > 0 ? "border-t border-black/[0.06]" : ""}`}
          >
            <img
              src={withBasePath(avatarUrl)}
              alt={avatarAlt}
              className="h-10 w-10 shrink-0 rounded-[4px] object-cover md:h-11 md:w-11"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-semibold text-[#576b95]">{authorName}</h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#1f1f1f]">
                {moment.content}
              </p>

              <ImageGrid
                images={moment.images || []}
                onOpen={(imageIndex) =>
                  setLightbox({ images: (moment.images || []).map(withBasePath), index: imageIndex })
                }
              />

              {moment.location && (
                <p className="mt-2 flex items-center gap-1 text-xs text-[#576b95]">
                  <MapPin size={12} />
                  {moment.location}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#767676]">
                <time dateTime={moment.date}>{formatDate(moment.date)}</time>
                <span aria-hidden="true" className="text-[15px] leading-none text-[#767676]">♡</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
                }}
                className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
                }}
                className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain"
          />
        </div>
      )}
    </div>
  );
}
