import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { siteConfig } from '../../siteConfig';

export const metadata = {
  title: 'Build Log | ' + siteConfig.title,
  description:
    'How this site was built: the decisions behind it, the process week by week, and what I checked before calling it finished.',
};

const pages = [
  { route: '/', name: 'Home', purpose: 'Short introduction, latest writing, photo wall and dashboard.', interactive: 'Live clock, rotating carousel, music player, theme switch' },
  { route: '/posts', name: 'Posts', purpose: 'Longer write-ups about things I built or got stuck on.', interactive: 'Search and tag filtering' },
  { route: '/posts/[slug]', name: 'Article', purpose: 'One article with table of contents and reading progress.', interactive: 'Scroll spy, copy-button on code blocks' },
  { route: '/chatter', name: 'Musings', purpose: 'Shorter, looser notes than the articles.', interactive: 'Filter by tag, mood badges' },
  { route: '/timeline', name: 'Timeline', purpose: 'Everything I have published, in one chronological view.', interactive: 'Expandable timeline nodes' },
  { route: '/local-posts', name: 'Local Drafts', purpose: 'Drafts written in the browser and stored only on this device.', interactive: 'Local save, open, delete' },
  { route: '/courses', name: 'Courses', purpose: 'My weekly timetable for this semester.', interactive: 'Editable lessons, week switch' },
  { route: '/resources', name: 'Resources', purpose: 'Study links I keep coming back to.', interactive: 'Category filters, add your own' },
  { route: '/photowall', name: 'Photo Wall', purpose: 'Albums of screenshots and photos, with captions.', interactive: 'Lightbox with keyboard navigation' },
  { route: '/moments', name: 'Moments', purpose: 'Short diary entries with a location and images.', interactive: 'Image lightbox, comments' },
  { route: '/music', name: 'Music', purpose: 'What I listen to while coding.', interactive: 'Full free-licensed tracks and popular previews' },
  { route: '/checkin', name: 'Check-in', purpose: 'Time-block tracking with a monthly log.', interactive: 'Timer, calendar heat-map, export/import' },
  { route: '/tree', name: 'Creative Workshop', purpose: 'Small 3D and canvas experiments.', interactive: 'Interactive 3D scenes' },
  { route: '/about', name: 'About Me', purpose: 'Who I am and why the site exists.', interactive: 'Profile card, social links' },
  { route: '/friends', name: 'Friends', purpose: 'Sites I read, and how to apply to be listed.', interactive: 'Friend-link cards' },
];

const process = [
  { period: 'Apr 27 – May 20', commits: '35', work: 'Started from a blog template, added LaTeX support, rebuilt the API layer and the launcher, and got a first version running locally.' },
  { period: 'Jun 8 – Jul 13', commits: '3', work: 'Small fixes and license/attribution clean-up over the summer break.' },
  { period: 'Oct 14 – Oct 18', commits: '51', work: 'The main build: pages and components, the desktop pet, check-in, accessibility fixes, performance work, Cloudflare Pages deployment and the local package for submission.' },
  { period: 'Oct 21', commits: 'this rewrite', work: 'Full English rewrite of the interface and articles, rebuilt navigation, and a final accessibility and responsiveness pass.' },
  { period: 'Oct 24', commits: 'polish pass', work: 'Type checking turned back on, reduced-motion support, sitemap/robots/RSS/manifest/Open Graph, phone asset loading cut by more than half, and dead components removed.' },
];

const decisions = [
  { title: 'Licensed 30-second previews, not a pirated stream', body: 'Mainstream streaming endpoints either need a paid account (NetEase now sends anonymous listeners to /404) or refuse datacenter IPs (Apple\'s API blocks Cloudflare). The playlist therefore has two halves: eight full-length free-licensed instrumentals from ccMixter, hosted with the site and credited on /music under their CC BY licences, which play offline on any device; and 30-second Apple previews of popular songs. Playback is legal and guaranteed instead of pretending a stream works.' },
  {
    title: 'Next.js App Router, exported as static files',
    body:
      'The brief needs no server-side programming, so the site is a static export: plain HTML, CSS and JavaScript that can be hosted anywhere. The build produces the whole site ahead of time, which keeps it fast and cheap to host, and means the local package for grading is the same code that runs online.',
  },
  {
    title: 'Articles are Markdown files in the repository',
    body:
      'Every post, moment and musing is a Markdown file next to the code. That keeps the writing in version control, so the git history also shows when each piece was written and edited, and there is no database or CMS to maintain. Comments in the code use the same approach.',
  },
  {
    title: 'Browser storage instead of a database',
    body:
      'Timetable edits, study links, photo albums and check-in records live in localStorage. That satisfies "no database required" and keeps the site free to host, but the trade-off is that data belongs to one browser. Each of those pages therefore has export and import buttons, and the limitation is stated in the interface rather than hidden.',
  },
  {
    title: 'Self-hosted images and fonts',
    body:
      'Photos are compressed to WebP and stored in the repository instead of being hot-linked from an image host, and fonts are self-hosted too. Nothing on the page depends on a third-party CDN, which makes the site work offline in the local package and removes a whole class of broken-image bugs.',
  },
  {
    title: 'One codebase, two hosts',
    body:
      'Cloudflare Pages runs the main site, including a small Pages Function for the pet chat. GitHub Pages mirrors the same static build and demonstrates that the site still works with no server at all. A shared path helper keeps every asset URL correct when the site is served from a sub-directory.',
  },
  {
    title: 'Rebuilt navigation for the English version',
    body:
      'The original navigation had twelve top-level items and a circular, drag-to-rotate menu on phones. It looked distinctive but was hard to use and impossible to operate with a keyboard. The rewrite groups the pages into six sections with accessible dropdowns, and replaces the circular menu with a standard drawer that traps focus, closes on Escape and restores focus to the trigger.',
  },
];

const checks = [
  'Every page is rendered by the production build and statically exported without errors; the build now type-checks the project instead of skipping TypeScript errors.',
  'All internal links, images, stylesheets and scripts return 200 — checked by following every link on every page with a script, not by clicking a few by hand.',
  'One main landmark and one h1 per page; headings run in order without skipping levels.',
  'Images carry meaningful alt text, or an empty alt when they are purely decorative.',
  'Icon-only buttons have accessible names; every form control has a visible label.',
  'Navigation works with the keyboard alone: Tab, Enter, Escape, and arrow keys inside menus.',
  'Focus is always visible, and the mobile drawer traps focus and restores it on close.',
  'The layout was tested at 1280px, 768px and 390px wide, including the timetable, check-in calendar, photo wall and navigation.',
  'Colors meet WCAG AA contrast in both light and dark themes, and heavy background effects are disabled on small screens and for visitors who prefer reduced motion.',
  'The HTML language is set to en, dates and numbers are formatted in English, and no Chinese text remains anywhere in the interface, articles or metadata.',
  'Reduced-motion mode removes every decorative animation (measured 113 animated elements down to 0) and skips the splash screen, while navigation and forms keep working.',
  'On a throttled 4G phone profile the home page went from 1.45 MB and 5.6 s LCP to 655 KB and 2.4 s; the pet no longer preloads its sprites on phones.',
  'SEO files are generated at build time: sitemap.xml, robots.txt, rss.xml, manifest.webmanifest, Open Graph/Twitter cards and JSON-LD.',
  'Full-length tracks play from the site\'s own audio files (checked offline in the local package and online), and every preview is labelled as a 30-second clip.',
];

export default function BuildLogPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 mx-auto mt-24 w-full max-w-4xl px-4 pb-20 sm:mt-28 sm:px-6">
        <header className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-10 dark:border-white/10 dark:bg-slate-900/60">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
            Process and decisions
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Build Log
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300">
            This page records how the site was built: what the brief asked for, the decisions behind it,
            how the work moved forward week by week, and what I actually checked before calling it finished.
            It is also the material I use to explain the project in the defence.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <a
              href="https://cxy0218-blog.pages.dev/"
              className="rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500"
            >
              Live site ↗
            </a>
            <a
              href="https://github.com/Chen070218/Cxy0218-blog"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
            >
              Repository ↗
            </a>
          </div>
        </header>

        <section aria-labeledby="brief" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="brief" className="text-2xl font-black text-slate-900 dark:text-white">
            Against the brief
          </h2>
          <ul className="mt-4 space-y-3 text-slate-700 dark:text-slate-300">
            <li><strong className="text-slate-900 dark:text-white">At least four pages with working navigation.</strong> Fifteen routes, grouped into six sections. Every link is checked by a script that walks the whole site.</li>
            <li><strong className="text-slate-900 dark:text-white">Own content.</strong> Six long articles, three moments and one design note, all written from my own coursework and debugging sessions — sorting assignments, the Linux lab, the move between two computers, the performance investigation.</li>
            <li><strong className="text-slate-900 dark:text-white">Semantic, accessible markup.</strong> Landmarks, heading hierarchy, labeled controls, keyboard-operable menus, visible focus, reduced-motion support and AA contrast in both themes.</li>
            <li><strong className="text-slate-900 dark:text-white">Responsive layout.</strong> Tested at phone, tablet and desktop widths; the navigation, timetable, check-in calendar and photo wall all have dedicated small-screen layouts.</li>
            <li><strong className="text-slate-900 dark:text-white">At least one interactive element.</strong> The site goes well past one: a live clock, a pomodoro timer, a check-in tracker with calendar heat-map, an editable timetable, search and filters, a photo lightbox and a desktop pet with a state machine.</li>
            <li><strong className="text-slate-900 dark:text-white">Live at a real address.</strong> <a className="text-indigo-600 underline dark:text-indigo-400" href="https://cxy0218-blog.pages.dev/">cxy0218-blog.pages.dev</a>, with a GitHub Pages mirror.</li>
            <li><strong className="text-slate-900 dark:text-white">Git history showing the work develop.</strong> More than 90 commits on <code className="rounded bg-slate-200/70 px-1 dark:bg-white/10">main</code> between April and October, including this rewrite.</li>
            <li><strong className="text-slate-900 dark:text-white">No server-side programming or database required.</strong> The site is a static export and all user data stays in the browser.</li>
          </ul>
        </section>

        <section aria-labeledby="pages" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="pages" className="text-2xl font-black text-slate-900 dark:text-white">
            What is on the site
          </h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Fifteen routes, each with a reason to exist and something to do on it.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Pages on the site, their purpose and their interactive element</caption>
              <thead>
                <tr className="border-b border-slate-300/70 dark:border-slate-600">
                  <th scope="col" className="py-2 pr-4 font-black text-slate-900 dark:text-white">Route</th>
                  <th scope="col" className="py-2 pr-4 font-black text-slate-900 dark:text-white">Purpose</th>
                  <th scope="col" className="py-2 font-black text-slate-900 dark:text-white">Interactive</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.route} className="border-b border-slate-200/70 align-top dark:border-slate-700/60">
                    <th scope="row" className="whitespace-nowrap py-3 pr-4 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {page.route}
                    </th>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">{page.name}</span> — {page.purpose}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{page.interactive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labeledby="process" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="process" className="text-2xl font-black text-slate-900 dark:text-white">
            The process, week by week
          </h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Commit counts come from <code className="rounded bg-slate-200/70 px-1 dark:bg-white/10">git rev-list --count</code> on
            the main branch. Commit messages use a prefix convention (feat, fix, content, chore) so the history reads as a list
            of decisions rather than a list of saves.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Development periods and what was done in each</caption>
              <thead>
                <tr className="border-b border-slate-300/70 dark:border-slate-600">
                  <th scope="col" className="py-2 pr-4 font-black text-slate-900 dark:text-white">Period</th>
                  <th scope="col" className="py-2 pr-4 font-black text-slate-900 dark:text-white">Commits</th>
                  <th scope="col" className="py-2 font-black text-slate-900 dark:text-white">What happened</th>
                </tr>
              </thead>
              <tbody>
                {process.map((row) => (
                  <tr key={row.period} className="border-b border-slate-200/70 align-top dark:border-slate-700/60">
                    <th scope="row" className="whitespace-nowrap py-3 pr-4 font-bold text-slate-900 dark:text-white">{row.period}</th>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{row.commits}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{row.work}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The two quiet months are part of the record too. They are the summer break, and I would rather show an honest
            timeline — including the weeks when nothing happened — than back-date commits to look busier.
          </p>
        </section>

        <section aria-labeledby="decisions" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="decisions" className="text-2xl font-black text-slate-900 dark:text-white">
            Decisions worth defending
          </h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            Each of these was a choice between two reasonable options. This is the reasoning I would give if asked about it.
          </p>
          <ol className="mt-4 space-y-5">
            {decisions.map((decision) => (
              <li key={decision.title}>
                <h3 className="font-black text-slate-900 dark:text-white">{decision.title}</h3>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{decision.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labeledby="checks" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="checks" className="text-2xl font-black text-slate-900 dark:text-white">
            What I checked
          </h2>
          <p className="mt-2 text-slate-700 dark:text-slate-300">
            The project is only finished when these pass. Most of them are automated in the repository under{' '}
            <code className="rounded bg-slate-200/70 px-1 dark:bg-white/10">scripts/</code>, so I can re-run them after any change.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
            {checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labeledby="english" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="english" className="text-2xl font-black text-slate-900 dark:text-white">
            Writing the English version
          </h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            The course is taught in English, so the whole site now speaks English: the interface, the six articles, the moments,
            the project and album descriptions, the metadata, and the accessible names of icons. Translating was not a find-and-replace.
            English labels are longer than the Chinese ones, which broke the old twelve-item navigation on a laptop and made the
            circular mobile menu unusable, so the navigation was rebuilt as part of the rewrite.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
            I kept the meaning and the details — command names, complexity numbers, file paths, error messages — and rewrote the tone
            so it sounds like a student explaining their own work rather than a translated document. Screenshots in the articles were
            retaken from the English build, so the pictures match the text again.
          </p>
        </section>

        <section aria-labeledby="tools" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="tools" className="text-2xl font-black text-slate-900 dark:text-white">
            Tools, and what I checked myself
          </h2>
          <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
            I use AI tools the way the course describes: for drafting, refactoring and reviewing. For this rewrite, AI drafted the
            English for the interface and the articles, and helped rewrite the navigation. I read every changed page, corrected the
            wording where it did not sound like me, and re-ran the build and the audits above until they passed.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
            The mistakes the checks caught are the useful part of the record: leftover Chinese characters in aria labels, dates still
            formatted in Chinese, nav labels overflowing their buttons, a mobile drawer that did not return focus, and one heading level
            that skipped from h1 to h3. All of them are fixed in the history, and I can point to the commit for each.
          </p>
        </section>

        <section aria-labeledby="next" className="mt-8 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/60">
          <h2 id="next" className="text-2xl font-black text-slate-900 dark:text-white">
            What I would do next
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
            <li>Replace browser-only drafts with a small exported file format, so a draft can move between devices without a database.</li>
            <li>Add automated visual regression tests for the timetable and check-in calendar, which are the two layouts most likely to break at odd widths.</li>
            <li>Keep the writing going: one article per topic I actually struggled with, instead of a burst of posts at the end.</li>
          </ul>
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            Back to <Link className="text-indigo-600 underline dark:text-indigo-400" href="/about">About Me</Link> or{' '}
            <Link className="text-indigo-600 underline dark:text-indigo-400" href="/posts">read the posts</Link>.
          </p>
        </section>
      </main>
    </>
  );
}
