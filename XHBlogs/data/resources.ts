// Starter content for the study resources library (shipped with the repo, so it shows up on any device)
//
// These are the sites I collected for this semester's courses: programming / algorithms and data structures / Linux operating systems / German / English.
// You can keep adding your own resources on the page; locally added items stay in the browser and never overwrite this list.

export interface StudyResource {
  id: string;
  title: string;
  url: string;
  category: string;
  note: string;
}

export const studyResources: StudyResource[] = [
  { id: 'mdn', title: 'MDN Web Docs (Chinese edition)', url: 'https://developer.mozilla.org/zh-CN/', category: 'Frontend', note: 'The authoritative reference for HTML / CSS / JavaScript; I check properties here first when building a page.' },
  { id: 'python-tutorial', title: 'Python Tutorial (official, Chinese)', url: 'https://docs.python.org/zh-cn/3/tutorial/', category: 'Programming', note: 'The official tutorial from syntax to the standard library; works well read chapter by chapter.' },
  { id: 'cppreference', title: 'cppreference (Chinese site)', url: 'https://zh.cppreference.com/', category: 'Programming', note: 'Quick reference for the C / C++ standard library, more accurate than a search engine.' },
  { id: 'visualgo', title: 'VisuAlgo (Chinese edition)', url: 'https://visualgo.net/zh', category: 'Algorithms', note: 'Sorting, trees and graphs are easier to understand when you watch them move than when you memorize the code.' },
  { id: 'leetcode', title: 'LeetCode (Chinese edition)', url: 'https://leetcode.cn/', category: 'Algorithms', note: 'Practice problems by tag; most of the Algorithms and Data Structures exercises line up with them.' },
  { id: 'oi-wiki', title: 'OI Wiki', url: 'https://oi-wiki.org/', category: 'Algorithms', note: 'Topic notes on data structures and algorithms; the complexity analysis is explained systematically.' },
  { id: 'missing-semester', title: 'The Missing Semester (MIT, Chinese)', url: 'https://missing-semester-cn.github.io/', category: 'Operating Systems', note: 'An intro to the command line, shell scripts and Git; I watch it alongside the Linux class.' },
  { id: 'linux-man', title: 'Linux man pages', url: 'https://man7.org/linux/man-pages/', category: 'Operating Systems', note: 'The most accurate source for what a command flag actually means.' },
  { id: 'git-book', title: 'Pro Git (Chinese edition)', url: 'https://git-scm.com/book/zh/v2', category: 'Tools', note: 'The branch and merge chapters are worth rereading; I used them for course projects too.' },
  { id: 'dw-german', title: 'DW Learn German', url: 'https://learngerman.dw.com/zh/overview', category: 'German', note: 'Deutsche Welle free course (Chinese interface), starting at A1, with listening exercises.' },
  { id: 'leo-dict', title: 'LEO German-English dictionary', url: 'https://dict.leo.org/german-english/', category: 'German', note: 'More detail on gender and fixed phrases than an ordinary dictionary.' },
  { id: 'bbc-english', title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/', category: 'English', note: 'Short audio with text, good for listening practice in spare moments.' },
  { id: 'cnmooc', title: 'China University MOOC', url: 'https://www.icourse163.org/', category: 'Courses', note: 'Intro computer science courses to catch up with class progress.' },
  { id: 'khan-math', title: 'Khan Academy Math (Chinese edition)', url: 'https://zh.khanacademy.org/math', category: 'Mathematics', note: 'Where I go back to fill in the Mathematics I / II topics that trip me up.' },
];
