// Photo wall data. Every image here is a screenshot I took of my own work:
// the site itself, or the screens I saw while putting it online.
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    id: 'pages-of-the-site',
    title: 'Pages of the site',
    description:
      'Six screens from the site I built this year: the home page, the writing index, an article, the check-in heat-map, the badminton page and the short about page.',
    cover: '/photos/own/home.webp?v=ledger',
    date: '2026.10',
    photos: [
      { url: '/photos/own/home.webp?v=ledger', caption: 'Home, after the October redesign' },
      { url: '/photos/own/posts.webp?v=ledger', caption: 'The writing index' },
      { url: '/photos/own/article.webp?v=ledger', caption: 'An article, with its table of contents' },
      { url: '/photos/own/checkin.webp?v=ledger', caption: 'The check-in heat-map' },
      { url: '/photos/own/resources.webp?v=ledger', caption: 'The badminton page' },
      { url: '/photos/own/about.webp?v=ledger', caption: 'About, kept short' }
    ]
  },
  {
    id: 'course-screenshots',
    title: 'The course behind the site',
    description:
      'Screens from the Web Technologies course that taught me all of this: the lesson index, the HTML and JavaScript decks, the live box-model and Flexbox-versus-Grid demos, and the Git lesson.',
    cover: '/photos/own/course-lessons.webp?v=ledger',
    date: '2026.10',
    photos: [
      { url: '/photos/own/course-lessons.webp?v=ledger', caption: 'The course: eight lessons' },
      { url: '/photos/own/course-fundamentals.webp?v=ledger', caption: 'Lesson 1 — Web fundamentals' },
      { url: '/photos/own/course-html.webp?v=ledger', caption: 'Lesson 2 — HTML' },
      { url: '/photos/own/course-boxmodel.webp?v=ledger', caption: 'The live box-model demo' },
      { url: '/photos/own/course-flexgrid.webp?v=ledger', caption: 'Flexbox vs Grid, side by side' },
      { url: '/photos/own/course-js.webp?v=ledger', caption: 'Lesson 5 — JavaScript' },
      { url: '/photos/own/course-git.webp?v=ledger', caption: 'Git & GitHub' }
    ]
  },
  {
    id: 'first-deploy',
    title: 'The first deploy',
    description:
      'The unglamorous part of putting a site online: a repository, a deploy, a domain and an environment key. These are the screens from the week it first worked.',
    cover: '/photos/own/first-deploy.webp?v=ledger',
    date: '2026.04',
    photos: [
      { url: '/photos/own/repo.webp?v=ledger', caption: 'Creating the repository' },
      { url: '/photos/own/first-deploy.webp?v=ledger', caption: 'The first deploy that worked' },
      { url: '/photos/own/deploy-dashboard.webp?v=ledger', caption: 'Deployments and domains in one panel' },
      { url: '/photos/own/dns-records.webp?v=ledger', caption: 'Pointing the domain: DNS records' },
      { url: '/photos/own/env-vars.webp?v=ledger', caption: 'The environment variables, after two renames' }
    ]
  },
  {
    id: 'broken-then-fixed',
    title: 'Broken, then fixed',
    description:
      'Three things that did not work the first time. I kept the screenshots because the errors are part of the process, and because they are easier to explain than a finished page.',
    cover: '/photos/own/music-error.webp?v=ledger',
    date: '2026.10',
    photos: [
      { url: '/photos/own/deploy-failed.webp?v=ledger', caption: 'The first failed deployment' },
      { url: '/photos/own/dns-error.webp?v=ledger', caption: 'DNS, not yet' },
      { url: '/photos/own/music-error.webp?v=ledger', caption: 'The music service changed its rules' }
    ]
  }
];
