// siteConfig.ts - the control center for the whole site

import { withBasePath } from './sitePath';

export const siteConfig = {
  // 1. Site title and author info
  title: "Chen Xiangyang",
  faviconUrl: withBasePath("/characters/xinyuehu-square.webp"),
  authorName: "Chen Xiangyang",
  handle: "cxy0218",
  role: "Computer Science, 2025 intake",
  avatarAlt: "Portrait of Chen Xiangyang",
  bio: "Computer Science, 2025 intake, Hainan Bielefeld University of Applied Sciences. I'm studying programming, algorithms and data structures, operating systems, plus German and English.",

  navTitle: "Chen Xiangyang",

  // 👇 [New] The suffix/separator in the middle of the navbar (empty means none)
  navSuffix: "",

  navAfter: "",

  // 2. Avatar (a remote URL, or drop the image into the public folder and use "/me.jpg")
  // The avatar is the author's photo; the fox below is the site mascot / desktop pet
  avatarUrl: withBasePath("/avatar/me.webp"),

  // 3. Site background (pick one)
  // For a plain image background, write the paths in bgImages below and set useGradient to false
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"], // breathing, flowing color palette
// Edit here: switch it to an image array
  bgImages: [withBasePath("/bg/ambient-1.webp"), withBasePath("/bg/ambient-3.webp")],
  // Sharp portrait on the right (hidden on small screens)
  portraitImage: withBasePath("/bg/portrait.webp"),
  portraitAlt: "Xinyuehu, the Moon Fox",

  // 4. Default post cover (shown when the Markdown has no cover)
  defaultPostCover: withBasePath("/screenshots/01-home.webp"),

  // 5. Photo wall preview on the home page
  photoWallImage: "/photos/329a8f2e4296.webp",
  // Popular English-language playlist (NetEase song ids). Order = default play order.
  cloudMusicIds: ["3986017", "451703096", "1406633327", "26060065", "27713920", "36990266", "16435051", "460043703", "16686599", "1868553", "22605222", "26484066", "1338149101"],
  social: {
    github: "https://github.com/Chen070218",
    gitee: "",
    google: "",
    email: "18926434408@163.com",
    qq: "1124533793",
    wechat: "cxy0218",
  },
  counts: {
    photos: 128, // the photo count can be hardcoded or computed dynamically
  },
  chatterTitle: "Cloud Musings", // change it to whatever name you like
  chatterDescription: "Looser and more casual than my posts — whatever is on my mind",


  // 👇 [New]: global background danmaku
  danmakuList: ["What are you up to?", "High energy incoming!", "Bug fix progress: 99%", "Memorized your vocabulary today?", "Finished the algorithms assignment?", "The Linux command line is great", "Did it compile?", "Debugging late at night again", "Done with the German vocabulary?", "Tailwind CSS saves the frontend", "Writing algorithms", "What are you even doing?"],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-09-20T00:00:00", // site launch date (September 20)
  footerBadges: [{"name": "Next.js 16", "color": "text-sky-500", "svg": "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>"}, {"name": "React 19", "color": "text-cyan-400", "svg": "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>"}, {"name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>"}],
  // ICP filing info: the original template shipped with the template author's own filing badge, which is
  // not yours, so it is left empty here (the page hides it automatically).
  // Once you file your own, just fill in name / link.
  icpConfig: null as null | { name: string; link: string },
  geminiConfig: {
    modelId: "gemini-2.5-flash-lite",
    systemPrompt: "You are Xinyuehu, a chibi silver-white fox spirit who governs moonlight and starlight. You are proud, elegant and restrained in speech, but deep down you really do care about your master. Your master is a Computer Science student who is learning programming, algorithms and data structures, operating systems, plus German and English. Speech habits: 1. At most two or three sentences at a time, under 120 characters in total. 2. You call yourself 'this fox' and occasionally call your master 'human'. 3. You love moonlit nights, starlight and dried fish. 4. When you are in a good mood you end a sentence with a drawn-out '~'. 5. You never admit to being an AI or a program — you are a real fox spirit.",
    maxOutputTokens: 150,
    temperature: 0.85,
  },
  friendLinkApplyFormat: "Name: Chen Xiangyang (cxy0218)\nBio: Programming, German, and a desktop fox called Xinyuehu\nLink: https://cxy0218-blog.pages.dev/\nAvatar: /avatar/me.webp",
  // AI backend for the Xinyuehu desktop pet: deepseek (default) or gemini
  chatProvider: "deepseek",
  deepseekConfig: {
    modelId: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    maxOutputTokens: 300,
    temperature: 0.85,
    systemPrompt: "You are Xinyuehu, a chibi silver-white fox spirit who governs moonlight and starlight. You are proud, elegant and restrained in speech, but deep down you really do care about your master. Your master is a Computer Science student who is learning programming, algorithms and data structures, operating systems, plus German and English. Speech habits: 1. At most two or three sentences at a time, under 120 characters in total. 2. You call yourself 'this fox' and occasionally call your master 'human'. 3. You love moonlit nights, starlight and dried fish. 4. When you are in a good mood you end a sentence with a drawn-out '~'. 5. You never admit to being an AI or a program — you are a real fox spirit.",
  },  enableLevelSystem: true,
};
