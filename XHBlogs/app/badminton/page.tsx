import Link from 'next/link';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';

export const metadata = {
  title: 'Badminton | ' + siteConfig.title,
  description:
    'The sport Chen Xiangyang plays off the clock: how a match works, the gear that matters for a beginner, what to practise, and a reading list from 中羽在线.',
};

const rules = [
  'A match is the best of three games. Each game goes to 21 points, and every rally scores a point — there is no need to be serving to win one.',
  'At 20–20 you need a two-point lead. At 29–29 the next point wins the game (the 30-point cap).',
  'You serve diagonally, from the right service court when your score is even and from the left when it is odd. The serve must be below 1.15 m and hit upwards in one motion.',
  'Singles uses the inner sidelines; doubles uses the outer ones. The short service line matters for the serve; the doubles back boundary applies in doubles.',
  'Players change ends after each game, and the winner of the previous game serves first in the next one.',
];

const gear = [
  ['Racket', '4U (80–84 g) is the sensible first weight; 3U (85–89 g) if you are stronger. A light, flexible racket is easier on the shoulder than a pro frame.'],
  ['Strings', '22–24 lb is plenty while learning. The forum talks about 26 lb because experienced players want control; it is not a requirement.'],
  ['Grip', 'G5 or G6 handle with an overgrip. A grip too thick makes it hard to change from forehand to backhand.'],
  ['Shuttle', 'Nylon shuttles for practice, feather shuttles for matches. Feather flies better and breaks faster; nylon is cheaper while learning.'],
  ['Shoes', 'The most underrated piece. Court shoes grip and support the ankle; running shoes are not designed for lunging.'],
];

const practice = [
  ['Grip', 'Forehand and backhand grip changes are the first thing to make automatic. If the grip is wrong, every shot after it is a correction.'],
  ['Footwork', 'Split step as the opponent hits, then move to the corner and recover to the middle. Six corners, not just the four sides.'],
  ['Basic strokes', 'Clear to the back, drop to the front, smash when the shuttle is high, drive in a flat rally, lift from the net.'],
  ['Serve', 'Low serve for doubles, high serve for singles. Practise landing it in the correct service court, not just getting it over.'],
  ['Doubles', 'After a shot, move to cover the open side with your partner. A good pair is two people covering each other, not two people chasing the same shuttle.'],
];

const reading = [
  {
    title: '新手训练的一些心得：步伐 / 挥拍 / 握拍',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=1955249',
    note: 'The thread I wish I had read before my first month: footwork and grip explained from a beginner’s point of view.',
  },
  {
    title: '李宇轩教练教学（非网课）学习笔记',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=1469981',
    note: 'Notes from a coach’s video series — useful when a movement feels wrong and I cannot see why.',
  },
  {
    title: '长文分享：进阶中一些关键的技术难点和个人认知',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=2883323',
    note: 'A long advanced post about the details that separate “can hit it” from “can play”.',
  },
  {
    title: 'BWF 更新了发球规则，裁判权利更大了',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=3486786',
    note: 'A reminder that the service rules change; I check this before playing a competition.',
  },
  {
    title: '到底怎么穿才是 26 磅？',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=3748234',
    note: 'String tension explained by people who string rackets. The conclusion for me: 24 lb is enough.',
  },
  {
    title: '业余男双 vs 混双应该用什么思路？',
    url: 'https://bbs.badmintoncn.com/forum.php?mod=viewthread&tid=3469301',
    note: 'Doubles positioning and rotation — the part of the game I am worst at.',
  },
  {
    title: '中羽在线装备库',
    url: 'https://www.badmintoncn.com/list-6-1.html',
    note: 'The equipment index I use when a friend asks what racket to buy. Read the beginner threads before the expensive ones.',
  },
];

const glossary = [
  ['Clear', 'A high shot to the back of the opponent’s court — the shot that buys time.'],
  ['Drop', 'A shot that looks like a clear but falls just over the net.'],
  ['Smash', 'A steep, fast shot from above; powerful but tiring and easy to counter if predictable.'],
  ['Drive', 'A flat shot at net height, used to keep the rally fast.'],
  ['Net shot', 'A soft shot played from the net that tumbles over.'],
  ['Lift', 'A high defensive shot from the net to the back court.'],
  ['Deuce', '20–20: you now need a two-point lead (or the 30-point cap).'],
  ['Let', 'A rally that is replayed, for example when the shuttle hits the net and falls over on the serve.'],
];

export default function BadmintonPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="mx-auto mt-24 w-[92%] max-w-4xl sm:mt-28 md:w-[90%]">
          <figure className="overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
            <img
              src="/covers/badminton-desk.webp"
              alt="A dark green badminton court diagram with a shuttlecock and the words Badminton, the sport I keep coming back to."
              width={1600}
              height={900}
              className="w-full object-cover"
            />
          </figure>

          <header className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-10 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Life · badminton
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              The sport I keep coming back to
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300">
              I am not a coach and I do not play at a high level. I play with friends, I lose
              more than I win, and I keep going back because an hour on court makes the rest of
              the week easier. These are the notes I made while learning: the rules I had to
              look up, the gear that actually matters, and what I practise.
            </p>
          </header>

          <section aria-labelledby="rules" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="rules" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              How a match works
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {rules.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="gear" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="gear" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              What I play with
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              My first racket was too heavy and strung too tight. This is the version I would
              tell a beginner.
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {gear.map(([term, detail]) => (
                <div key={term} className="border-t border-white/15 pt-3">
                  <dt className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="practice" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="practice" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              What I practise
            </h2>
            <ul className="mt-4 space-y-4">
              {practice.map(([title, detail]) => (
                <li key={title}>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="reading" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="reading" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Reading list · 中羽在线
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              The Chinese badminton forum 中羽在线 is where the detailed discussions happen:
              equipment, technique and the rules. These are the threads I actually read; the
              links open the forum in a new tab.
            </p>
            <ul className="mt-4 space-y-4">
              {reading.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-500 dark:text-indigo-300"
                  >
                    {item.title} ↗
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Some forum pages require a 中羽在线 account; the equipment index is public.
            </p>
          </section>

          <section aria-labelledby="glossary" className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
            <h2 id="glossary" className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Words I had to learn
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {glossary.map(([term, meaning]) => (
                <div key={term}>
                  <dt className="text-sm font-black text-slate-900 dark:text-white">{term}</dt>
                  <dd className="text-sm text-slate-700 dark:text-slate-300">{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Back to <Link href="/about" className="font-bold text-indigo-600 underline underline-offset-4 dark:text-indigo-300">about me</Link>.
          </p>
        </main>
      </PageTransition>
    </div>
  );
}
