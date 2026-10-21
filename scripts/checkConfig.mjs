import fs from 'fs';
import path from 'path';

console.log('\n🐱 Meiqiu is scanning both apps for siteConfig.ts differences and repairing them...');

// =================================================================
// 🌟 Part 1: full config guard shared by both apps (Common Configs)
// =================================================================
const commonConfigs = [
  { key: 'title', snippet: `\n  // 1. Site title and author info\n  title: "cxy0218",` },
  { key: 'faviconUrl', snippet: `\n  faviconUrl: withBasePath("/characters/xinyuehu-square.webp"),` },
  { key: 'authorName', snippet: `\n  authorName: "cxy0218",` },
  { key: 'bio', snippet: `\n  bio: "Computer Science, 2025 intake, Hainan Bielefeld University of Applied Sciences. I'm studying programming, algorithms and data structures, operating systems, plus German and English.",` },
  { key: 'navTitle', snippet: `\n  navTitle: "cxy0218",` },
  { key: 'navSuffix', snippet: `\n  // 👇 [New] The suffix/separator in the middle of the navbar (empty means none)\n  navSuffix: "",` },
  { key: 'navAfter', snippet: `\n  navAfter: "",` },
  { key: 'avatarUrl', snippet: `\n  // 2. Avatar (a remote URL, or drop the image into the public folder and use "/me.jpg")\n  avatarUrl: withBasePath("/characters/xinyuehu-square.webp"),` },
  { key: 'useGradient', snippet: `\n  // 3. Site background (pick one)\n  useGradient: false,` },
  { key: 'themeColors', snippet: `\n  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],` },
  { key: 'bgImages', snippet: `\n  bgImages: [withBasePath("/bg/ambient-1.webp"), withBasePath("/bg/ambient-3.webp")],` },
  { key: 'defaultPostCover', snippet: `\n  // 4. Default post cover (shown when the Markdown has no cover)\n  defaultPostCover: withBasePath("/screenshots/01-home.webp"),` },
  { key: 'photoWallImage', snippet: `\n  // 5. Photo wall preview on the home page\n  photoWallImage: "/photos/329a8f2e4296.webp",` },
  { key: 'cloudMusicIds', snippet: `\n  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],` },
  { key: 'social', snippet: `\n  social: {\n    github: "https://github.com/Chen070218",\n    gitee: "",\n    google: "",\n    email: "18926434408@163.com",\n    qq: "1124533793",\n    wechat: "cxy0218",\n  },` },
  { key: 'counts', snippet: `\n  counts: {\n    photos: 128,\n  },` },
  { key: 'chatterTitle', snippet: `\n  chatterTitle: "Cloud Musings",` },
  { key: 'chatterDescription', snippet: `\n  chatterDescription: "Looser and more casual than my posts — whatever is on my mind",` },
  { key: 'danmakuList', snippet: `\n  // 👇 [New]: global background danmaku\n  danmakuList: ["What are you up to?", "High energy incoming!", "Bug fix progress: 99%", "Memorized your vocabulary today?", "Finished the algorithms assignment?", "Linux command line is great", "Did it compile?", "Debugging late at night again", "Done with the German vocabulary?", "Tailwind CSS saves the frontend", "Writing algorithms", "What are you even doing?"],` },
  { key: 'gitalkConfig', snippet: `\n  gitalkConfig: {\n    clientID: "",\n    clientSecret: "",\n    repo: "",\n    owner: "",\n    admin: [""],\n  },` },
  { key: 'buildDate', snippet: `\n  buildDate: "2026-09-20T00:00:00",` },
  { key: 'footerBadges', snippet: `\n  footerBadges: [{"name": "Next.js 16", "color": "text-sky-500", "svg": "<path d=\\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\\"/>"}, {"name": "React 19", "color": "text-cyan-400", "svg": "<path d=\\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\\"/>"}, {"name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\\"/>"}],` },
  { key: 'icpConfig', snippet: `\n  // ICP filing info: the original template shipped with the template author's own filing badge, which is\n  // not yours, so it is left empty here (the page hides it automatically).\n  // Once you file your own, just fill in name / link.\n  icpConfig: null as null | { name: string; link: string },` },
  { key: 'geminiConfig', snippet: `\n  geminiConfig: {\n    modelId: "gemini-2.5-flash-lite",\n    systemPrompt: "You are Xinyuehu, a chibi silver-white fox spirit who governs moonlight and starlight. You are proud, elegant and restrained in speech, but deep down you really do care about your master. Your master is a Computer Science student who is learning programming, algorithms and data structures, operating systems, plus German and English. Speech habits: 1. At most two or three sentences at a time, under 120 characters in total. 2. You call yourself 'this fox' and occasionally call your master 'human'. 3. You love moonlit nights, starlight and dried fish. 4. When you are in a good mood you end a sentence with a drawn-out '~'. 5. You never admit to being an AI or a program — you are a real fox spirit.",\n    maxOutputTokens: 150,\n    temperature: 0.85,\n  },` },
  { key: 'friendLinkApplyFormat', snippet: `\n  friendLinkApplyFormat: "Name: cxy0218\\nBio: Programming, German, and a desktop fox called Xinyuehu\\nLink: https://cxy0218-blog.pages.dev/\\nAvatar: /characters/xinyuehu-square.webp",` },
  // 👇 [New]: RPG level and badge system switch
  { key: 'enableLevelSystem', snippet: `\n  // 👇 [New]: RPG level and badge system switch (shown in the Creative Workshop, the Dijiang and the guestbook)\n  enableLevelSystem: true,` }
];

// =================================================================
// 🌟 Part 2: manager-only config (Manager Specific Configs)
// =================================================================
const managerSpecificConfigs = [
  { key: 'picBedName', snippet: `\n  // 👇 [New]: core image-host config (PicBed Configuration)\n  picBedName: "Image host",` },
  { key: 'picBedUrl', snippet: `\n  picBedUrl: "", // default Lsky Pro API URL` },
  { key: 'picBedToken', snippet: `\n  picBedToken: "", // leave it empty; you can fill it in from the console and override it later` }
];

// =================================================================
// 🌟 Part 3: assemble the scan tasks
// =================================================================
const tasks = [
  {
    name: '[manager]',
    filePath: path.resolve('./my-blog-manager/siteConfig.ts'),
    // the manager needs: shared config + its own image-host config
    configs: [...commonConfigs, ...managerSpecificConfigs] 
  },
  {
    name: '[site]',
    filePath: path.resolve('./XHBlogs/siteConfig.ts'),
    // the site only needs the shared config
    configs: [...commonConfigs] 
  }
];

// =================================================================
// 🌟 Part 4: run the per-app scan and repair
// =================================================================
tasks.forEach(task => {
  if (!fs.existsSync(task.filePath)) {
    console.log(`⚠️ Note: ${task.name} siteConfig.ts not found, skipped.`);
    return;
  }

  let content = fs.readFileSync(task.filePath, 'utf8');
  let isUpdated = false;

  task.configs.forEach(item => {
    // check whether a config entry is missing (tolerates a space before or after the colon)
    if (!content.includes(`${item.key}:`) && !content.includes(`${item.key} :`)) {
      console.log(`🔍 ${task.name} missing entry: [${item.key}], filling it in...`);
      
      const lastBraceIndex = content.lastIndexOf('};');
      if (lastBraceIndex !== -1) {
        content = content.slice(0, lastBraceIndex) + item.snippet + '\n' + content.slice(lastBraceIndex);
        isUpdated = true;
      }
    }
  });

  if (isUpdated) {
    fs.writeFileSync(task.filePath, content, 'utf8');
    console.log(`✨ ${task.name} config scan and repair finished; every missing entry has been filled in!`);
  } else {
    console.log(`✅ ${task.name} config is complete, no repair needed.`);
  }
});
