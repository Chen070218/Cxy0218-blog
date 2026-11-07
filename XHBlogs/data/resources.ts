// Study resources for Web Technologies (BiUH), grouped by what I use them for.
// The course links are the pages I keep coming back to; the reference links are the
// places I check when a lesson leaves a detail out. Locally added items stay in the
// browser and never overwrite this list.

export interface StudyResource {
  id: string;
  title: string;
  url: string;
  category: string;
  note: string;
}

export const studyResources: StudyResource[] = [
  {
    id: 'webtech-course',
    title: 'Web Technologies — course lessons',
    url: 'https://webtech.landrock.io/course',
    category: 'This course',
    note: 'The full lesson path for the semester: fundamentals, HTML, CSS, JavaScript, project work, deployment, Vue and AI coding. I read the lesson before the class and again afterwards.',
  },
  {
    id: 'webtech-sessions',
    title: 'Web Technologies — sessions and slides',
    url: 'https://webtech.landrock.io/sessions',
    category: 'This course',
    note: 'Every slide deck, in order. The slides are the spine; the full lessons under /course have the detail the slides skip.',
  },
  {
    id: 'webtech-glossary',
    title: 'Course glossary',
    url: 'https://webtech.landrock.io/course/glossary',
    category: 'This course',
    note: 'The words I kept mixing up — repository, cascade, specificity, DOM, defer, CORS — defined in one place and linked back to the lesson.',
  },
  {
    id: 'webtech-toolkit',
    title: 'Course toolkit',
    url: 'https://webtech.landrock.io/toolkit',
    category: 'This course',
    note: 'How the course expects the environment to be set up: editor, browser DevTools, Live Server, Git and hosting. This is where I check a setup question before asking.',
  },
  {
    id: 'webtech-exam',
    title: 'The written exam — what it asks',
    url: 'https://webtech.landrock.io/exam/overview',
    category: 'This course',
    note: 'The four graded parts and what the written exam actually tests: reading code, telling HTML/CSS/JS apart, and finding errors — not writing code.',
  },
  {
    id: 'webtech-practice',
    title: 'Practice paper with answers',
    url: 'https://webtech.landrock.io/exam/practice',
    category: 'This course',
    note: 'A full 90-minute practice paper. I work through it with a timer, then read the answers and mark the mistakes I did not see.',
  },
  {
    id: 'webtech-box-model',
    title: 'The box model, live',
    url: 'https://webtech.landrock.io/demos/box-model.html',
    category: 'CSS',
    note: 'Drag the width, padding and border sliders and watch the computed size change. This is the demo that made content-box and border-box click for me.',
  },
  {
    id: 'webtech-flexgrid',
    title: 'Flexbox vs Grid, live',
    url: 'https://webtech.landrock.io/demos/flex-vs-grid.html',
    category: 'CSS',
    note: 'The same items in both layout systems, side by side. I use flexbox for one-dimensional rows and grid when the layout is genuinely two-dimensional.',
  },
  {
    id: 'mdn-html',
    title: 'MDN — HTML reference',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    category: 'HTML',
    note: 'The element reference I open when I am not sure whether an element is the right choice — and the page that taught me what alt text is for.',
  },
  {
    id: 'html-validator',
    title: 'W3C HTML validator',
    url: 'https://validator.w3.org/',
    category: 'HTML',
    note: 'Paste a URL and it lists every markup error. It finds the unclosed tag I have been staring at for twenty minutes.',
  },
  {
    id: 'mdn-css',
    title: 'MDN — CSS reference',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    category: 'CSS',
    note: 'The first place I check a property, especially for inherited-versus-not and for what a shorthand actually sets.',
  },
  {
    id: 'mdn-specificity',
    title: 'MDN — CSS specificity',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity',
    category: 'CSS',
    note: 'The four-part score from the lesson, with more examples. When a rule loses, I work out the score here before changing the selector.',
  },
  {
    id: 'caniuse',
    title: 'Can I use',
    url: 'https://caniuse.com/',
    category: 'CSS',
    note: 'Checks whether a CSS or JavaScript feature is safe to ship. Ten seconds instead of guessing whether a browser supports it.',
  },
  {
    id: 'mdn-js',
    title: 'MDN — JavaScript reference',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    category: 'JavaScript',
    note: 'Reference for the language and the DOM: querySelector, classList, addEventListener, localStorage and the error messages I keep meeting.',
  },
  {
    id: 'javascript-info',
    title: 'javascript.info',
    url: 'https://javascript.info/',
    category: 'JavaScript',
    note: 'A slower, clearer explanation of functions, objects, events and the DOM than most tutorials. Good for reading after the lesson.',
  },
  {
    id: 'webtech-git',
    title: 'The Git & GitHub lesson',
    url: 'https://webtech.landrock.io/slides/git-github.html',
    category: 'Git & deploy',
    note: 'The save-point explanation, the daily three commands, .gitignore, and the checklist for putting a site online. The page I reread before every deployment.',
  },
  {
    id: 'github-pages',
    title: 'GitHub Pages documentation',
    url: 'https://docs.github.com/en/pages',
    category: 'Git & deploy',
    note: 'The official steps for publishing a repository at a real address, including the branch and folder settings.',
  },
  {
    id: 'pro-git',
    title: 'Pro Git (free book)',
    url: 'https://git-scm.com/book/en/v2',
    category: 'Git & deploy',
    note: 'I have only read the first chapters so far, but they explain what a commit really contains better than any cheat sheet.',
  },
];
