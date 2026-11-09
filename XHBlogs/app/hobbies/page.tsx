import Link from 'next/link';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';

export const metadata = {
  title: 'Hobbies | ' + siteConfig.title,
  description:
    'What Chen Xiangyang does off the clock: badminton, Wuthering Waves, game soundtracks and screenshots.',
};

const hobbies = [
  {
    number: '01',
    title: 'Badminton',
    body:
      'The one sport I keep coming back to. I am not a coach and I do not play at a high level — I play with friends, lose more than I win, and still look forward to the next session. The badminton page has the rules I had to look up, the gear that matters, and a reading list from 中羽在线.',
    link: { href: '/badminton', label: 'Rules, gear and notes' },
  },
  {
    number: '02',
    title: 'Wuthering Waves',
    body:
      'An action RPG I play to switch off. I like the coastline around Jinzhou, the soundtrack, and the characters; the soundtrack is in my coding playlist too.',
    link: { href: '/photowall', label: 'Screenshots on the photo wall' },
  },
  {
    number: '03',
    title: 'Soundtracks while coding',
    body:
      'My study playlist is mostly game and anime soundtracks, with a few piano pieces. Lyrics distract me; a good instrumental does not. The music page has the actual list, including the free-licensed tracks I host with the site.',
    link: { href: '/music', label: 'Open the music page' },
  },
  {
    number: '04',
    title: 'Keeping screenshots',
    body:
      'I keep a photo wall of skies, campus corners and the places I travelled to this year. I am not a photographer — I just like noticing the light and keeping the frame. Most of them are quiet, ordinary moments.',
    link: { href: '/photowall', label: 'See the album' },
  },
];

export default function HobbiesPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="mx-auto mt-24 w-[92%] max-w-4xl sm:mt-28 md:w-[90%]">
          <header className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-10 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Life · hobbies
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Off the clock
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300">
              Four things I actually do when I am not studying. I would rather keep a short,
              honest list than collect hobbies I mention once.
            </p>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {hobbies.map((hobby) => (
              <section
                key={hobby.number}
                className="flex flex-col rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
                  {hobby.number}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {hobby.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {hobby.body}
                </p>
                <Link
                  href={hobby.link.href}
                  className="mt-4 inline-block text-sm font-bold text-indigo-600 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-500 dark:text-indigo-300"
                >
                  {hobby.link.label} →
                </Link>
              </section>
            ))}
          </div>

          <section className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              A smaller site, on purpose
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-300">
              The site used to have a project gallery, a 3D workshop and a page of friend links.
              After feedback that it tried to do too much, I removed them, stopped listing the
              browser draft viewer in the menu, and kept five sections. The pages that remain are
              the ones I actually use. This page is part of that: fewer things, described honestly.
            </p>
          </section>
        </main>
      </PageTransition>
    </div>
  );
}
