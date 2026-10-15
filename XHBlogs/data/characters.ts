// 角色图鉴数据
//
// 说明：image 指向 public/characters/<id>.webp。
// 文件不存在时会自动退化成"渐变色卡片"（不是坏图），所以你可以随时把自己的立绘丢进
// public/characters/ 目录、命名成 <id>.webp，刷新页面它就自动换成图片，不用改代码。

export interface GameCharacter {
  id: string;
  name: string;
  work: '鸣潮' | '原神';
  element: string;
  tags: string[];
  description: string;
  image: string;
  /** 角标与渐变色卡片的配色 [主色, 辅色] */
  accent: [string, string];
}

export const charactersData: GameCharacter[] = [
  {
    id: 'xinyuehu',
    name: '心月狐',
    work: '鸣潮',
    element: '月',
    tags: ['狐耳', '银白长发', '红白传统服', '本站看板娘'],
    description: '本站的看板角色：银白长发与狐耳、红白配色的传统服饰，气质清冷又带一点狡黠。右下角那只狐灵桌宠就是照着她的感觉做的。',
    image: '/characters/xinyuehu.webp',
    accent: ['#f43f5e', '#fbbf24'],
  },
  {
    id: 'changli',
    name: '长离',
    work: '鸣潮',
    element: '热熔',
    tags: ['红黑金', '传统服饰', '优雅'],
    description: '同样走中式传统配色路线，红黑金三色与心月狐的红白形成对照；气质偏沉稳端庄，适合放在一起做视觉搭配。',
    image: '/characters/changli.webp',
    accent: ['#dc2626', '#f59e0b'],
  },
  {
    id: 'jinhsi',
    name: '今汐',
    work: '鸣潮',
    element: '衍射',
    tags: ['银白', '中式', '端庄'],
    description: '银白色系 + 中式服饰的组合，和心月狐的白发质感接近，整体更偏清冷端正。',
    image: '/characters/jinhsi.webp',
    accent: ['#38bdf8', '#e0f2fe'],
  },
  {
    id: 'yinlin',
    name: '吟霖',
    work: '鸣潮',
    element: '导电',
    tags: ['冷艳', '紫黑', '气场强'],
    description: '紫黑色调的冷艳型角色，和红白色系放在一起会形成冷暖对比，做页面配色时很好用。',
    image: '/characters/yinlin.webp',
    accent: ['#8b5cf6', '#1e1b4b'],
  },
  {
    id: 'yae',
    name: '八重神子',
    work: '原神',
    element: '雷',
    tags: ['狐耳', '粉白', '神使'],
    description: '原神里最典型的狐系角色：狐耳 + 长发的组合，和心月狐的狐耳特征直接对应，只是配色偏粉紫。',
    image: '/characters/yae.webp',
    accent: ['#f472b6', '#a78bfa'],
  },
  {
    id: 'sara',
    name: '九条裟罗',
    work: '原神',
    element: '雷',
    tags: ['白发', '红黑', '天狗'],
    description: '白发 + 红黑配色的传统服饰，还有天狗羽翼这种兽类特征，是原神里和心月狐风格最接近的一位。',
    image: '/characters/sara.webp',
    accent: ['#ef4444', '#111827'],
  },
  {
    id: 'ganyu',
    name: '甘雨',
    work: '原神',
    element: '冰',
    tags: ['白发', '兽角', '蓝白'],
    description: '白发 + 兽类特征（麒麟角）的经典组合，配色偏蓝白，适合作为冷色调的搭配参考。',
    image: '/characters/ganyu.webp',
    accent: ['#60a5fa', '#e2e8f0'],
  },
  {
    id: 'ayaka',
    name: '神里绫华',
    work: '原神',
    element: '冰',
    tags: ['银白', '和风', '端庄'],
    description: '银白发色 + 传统服饰的另一条路线（和风），和红白中式形成同风格不同地域的对照。',
    image: '/characters/ayaka.webp',
    accent: ['#93c5fd', '#f1f5f9'],
  },
];