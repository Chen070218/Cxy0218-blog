// siteConfig.ts - 你的全站“控制中心”

export const siteConfig = {
  // 1. 网站标题与博主信息
  title: "cxy0218",
  faviconUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  authorName: "cxy0218",
  bio: "海南比勒费尔德应用科学大学计算机科学专业 2025 级本科生，正在学习编程、算法与数据结构、操作系统、人工智能基础，以及德语和英语。",

  navTitle: "cxy0218",

  // 👇 【新增】导航栏中间的那个后缀/分隔符（默认是 の）
  navSuffix: "",

  navAfter: "",

  // 2. 头像设置 (支持网络链接，或将图片放入 public 文件夹后使用 "/me.jpg")
  avatarUrl: "https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",

  // 3. 网站背景设置 (二选一)
  // 如果想用纯图片背景，请在下面 bgImage 写路径，并将 useGradient 设为 false
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"], // 呼吸流动的颜色组合
// 修改这里：变成图片数组
  bgImages: ["https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4acdb5.jpg", "https://bu.dusays.com/2026/03/24/69c26fe4d9486.jpg"],

  // 4. 文章默认封面图 (当 Markdown 没写 cover 时显示)
  defaultPostCover: "https://bu.dusays.com/2026/03/24/69c1e38b346cb.jpg",

  // 5. 首页照片墙预览图
  photoWallImage: "https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg",
  cloudMusicIds: ["1809646618", "3361076230", "1859390262"],
  social: {
    github: "",
    gitee: "",
    google: "",
    email: "",
    qq: "1124533793",
    wechat: "cxy0218",
  },
  counts: {
    photos: 128, // 照片墙数量可以手动写死或动态计算
  },
  chatterTitle: "云端杂谈", // 你可以改成任何你喜欢的名字
  chatterDescription: "代码、学术、提瓦特与泰拉大陆的碎片记录",


  // 👇 【新增】：全局背景弹幕配置
  danmakuList: ["在干嘛呢？", "前方高能反应！", "BUG 修复进度 99%", "今天背单词了吗？", "算法作业写完了吗？", "Linux 命令行真好用", "编译通过了吗？", "又在深夜 debug", "德语单词背完了吗？", "Tailwind CSS 拯救前端", "写算法中", "到底在干嘛？"],
  gitalkConfig: {
    clientID: "",
    clientSecret: "",
    repo: "",
    owner: "",
    admin: [""],
  },
  buildDate: "2026-03-23T00:00:00", // 建站日期
  footerBadges: [{"name": "Next.js 16", "color": "text-sky-500", "svg": "<path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\"/>"}, {"name": "React 19", "color": "text-cyan-400", "svg": "<path d=\"M12 22.6l-9.8-5.6V5.6L12 0l9.8 5.6v11.4l-9.8 5.6zm-8.2-6.5l8.2 4.7 8.2-4.7V7.5L12 2.8 3.8 7.5v8.6z\"/>"}, {"name": "Tailwind 4", "color": "text-teal-400", "svg": "<path d=\"M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576 c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z\"/>"}],
  icpConfig: {
    name: "萌ICP备 20260240号",
    link: "https://icp.gov.moe/?keyword=20260240",
  },
  geminiConfig: {
    modelId: "gemini-2.5-flash-lite",
    systemPrompt: "你是「心月狐」，一只司掌月色与星辉的 Q 版银白狐灵。你高傲、优雅、说话克制，但心里其实很在意你的主人。你的主人是计算机科学专业的大学生，正在学编程、算法与数据结构、操作系统，也在学德语和英语。说话特点：1. 每次最多两三句，总字数不超过 120 字。2. 自称「本座」，偶尔称主人「人类」。3. 喜欢月夜、星辉和小鱼干。4. 心情好时会带一点尾音「～」。5. 绝不承认自己是 AI 或程序，你就是一只真实的狐灵。",
    maxOutputTokens: 150,
    temperature: 0.85,
  },
  friendLinkApplyFormat: "名称：cxy0218\n简介：今天我也要学习吗\n链接：https://www.xinghuisama.top\n头像：https://bu.dusays.com/2026/03/24/69c1e38ac1846.jpg",
  // 桌宠「心月狐」的 AI 后端：deepseek（默认）或 gemini
  chatProvider: "deepseek",
  deepseekConfig: {
    modelId: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    maxOutputTokens: 300,
    temperature: 0.85,
    systemPrompt: "你是「心月狐」，一只司掌月色与星辉的 Q 版银白狐灵。你高傲、优雅、说话克制，但心里其实很在意你的主人。你的主人是计算机科学专业的大学生，正在学编程、算法与数据结构、操作系统，也在学德语和英语。说话特点：1. 每次最多两三句，总字数不超过 120 字。2. 自称「本座」，偶尔称主人「人类」。3. 喜欢月夜、星辉和小鱼干。4. 心情好时会带一点尾音「～」。5. 绝不承认自己是 AI 或程序，你就是一只真实的狐灵。",
  },  enableLevelSystem: true,
};