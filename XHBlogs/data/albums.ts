// Photo wall data. Every image here is a screenshot I took of my own work:
// the site itself, or the screens I saw while putting it online.
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    id: 'pages-of-the-site',
    title: 'Pages of the site',
    description:
      'Six screens from the site I built this year: the home page, the writing index, an article, the check-in heat-map, the study links and the short about page.',
    cover: '/photos/own/home.webp',
    date: '2026.10',
    photos: [
      { url: '/photos/own/home.webp', caption: 'Home, after the October redesign' },
      { url: '/photos/own/posts.webp', caption: 'The writing index' },
      { url: '/photos/own/article.webp', caption: 'An article, with its table of contents' },
      { url: '/photos/own/checkin.webp', caption: 'The check-in heat-map' },
      { url: '/photos/own/resources.webp', caption: 'Study links, kept in one place' },
      { url: '/photos/own/about.webp', caption: 'About, kept short' }
    ]
  },
  {
    id: 'course-screenshots',
    title: 'The course behind the site',
    description:
      'Screens from the Web Technologies course that taught me all of this: the lesson index, the HTML and JavaScript decks, the live box-model and Flexbox-versus-Grid demos, and the Git lesson.',
    cover: '/photos/own/course-lessons.webp',
    date: '2026.10',
    photos: [
      { url: '/photos/own/course-lessons.webp', caption: 'The course: eight lessons' },
      { url: '/photos/own/course-fundamentals.webp', caption: 'Lesson 1 — Web fundamentals' },
      { url: '/photos/own/course-html.webp', caption: 'Lesson 2 — HTML' },
      { url: '/photos/own/course-boxmodel.webp', caption: 'The live box-model demo' },
      { url: '/photos/own/course-flexgrid.webp', caption: 'Flexbox vs Grid, side by side' },
      { url: '/photos/own/course-js.webp', caption: 'Lesson 5 — JavaScript' },
      { url: '/photos/own/course-git.webp', caption: 'Git & GitHub' }
    ]
  },
  {
    id: 'first-deploy',
    title: 'The first deploy',
    description:
      'The unglamorous part of putting a site online: a repository, a deploy, a domain and an environment key. These are the screens from the week it first worked.',
    cover: '/photos/own/first-deploy.webp',
    date: '2026.04',
    photos: [
      { url: '/photos/own/repo.webp', caption: 'Creating the repository' },
      { url: '/photos/own/first-deploy.webp', caption: 'The first deploy that worked' },
      { url: '/photos/own/deploy-dashboard.webp', caption: 'Deployments and domains in one panel' },
      { url: '/photos/own/dns-records.webp', caption: 'Pointing the domain: DNS records' },
      { url: '/photos/own/env-vars.webp', caption: 'The environment variables, after two renames' }
    ]
  },
  {
    id: 'broken-then-fixed',
    title: 'Broken, then fixed',
    description:
      'Three things that did not work the first time. I kept the screenshots because the errors are part of the process, and because they are easier to explain than a finished page.',
    cover: '/photos/own/music-error.webp',
    date: '2026.10',
    photos: [
      { url: '/photos/own/deploy-failed.webp', caption: 'The first failed deployment' },
      { url: '/photos/own/dns-error.webp', caption: 'DNS, not yet' },
      { url: '/photos/own/music-error.webp', caption: 'The music service changed its rules' }
    ]
  }
];
