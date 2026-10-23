import { siteConfig } from '../../siteConfig';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import Link from 'next/link';

export const metadata = {
  title: 'About Me | ' + siteConfig.title,
  description: siteConfig.bio,
};

const facts = [
  { label: 'University', value: 'Hainan Bielefeld University of Applied Sciences' },
  { label: 'Major', value: 'Computer Science, 2025 intake' },
  { label: 'Languages', value: 'German and English' },
  { label: 'Learning now', value: 'Algorithms, operating systems, German' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="mx-auto mt-24 w-[92%] max-w-3xl sm:mt-28 md:w-[90%]">
          <section className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-10 dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left sm:gap-6">
              <img
                src={siteConfig.avatarUrl}
                alt={siteConfig.avatarAlt}
                width={112}
                height={112}
                className="h-24 w-24 flex-shrink-0 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28 dark:border-slate-800"
              />
              <div className="mt-4 sm:mt-0">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  {siteConfig.authorName}
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  {siteConfig.handle} · <span className="hidden sm:inline">Computer Science, 2025 intake</span><span className="sm:hidden">CS 2025</span>
                </p>
              </div>
            </div>

            <p className="mt-6 text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300">
              I study Computer Science at Hainan Bielefeld University of Applied Sciences, and I learn
              programming, algorithms and data structures, operating systems — plus German and English.
              I write things down when I figure them out, and this site is where I keep those notes.
            </p>
          </section>

          <section aria-labelledby="facts" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="facts" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Quick facts
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="site" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="site" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              What this site is
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              The posts are my study notes and debugging diaries. The check-in page tracks where my
              hours go, the timetable holds this semester's classes, and the photo wall keeps the
              screenshots I want to remember. Everything runs without a database: what I add stays in
              this browser, so moving devices means exporting and importing.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              The silver-white fox in the corner is Xinyuehu, the site's mascot and desktop pet.
            </p>
          </section>

          <section aria-labelledby="links" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="links" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Find me
            </h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <a
                href={siteConfig.social.github}
                className="rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500"
              >
                GitHub ↗
              </a>
              <a
                href={`mailto:${siteConfig.social.email}`}
                className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
              >
                Email
              </a>
              <Link
                href="/build-log"
                className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
              >
                How this site was built
              </Link>
              <Link
                href="/posts"
                className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
              >
                Read the posts
              </Link>
            </div>
          </section>
        </main>
      </PageTransition>
    </div>
  );
}
