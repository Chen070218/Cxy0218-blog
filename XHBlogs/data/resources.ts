// 学习资料库的初始内容（会随仓库一起发布，换设备也能看到）
//
// 这些是配合本学期课程整理的常用站点：编程 / 算法与数据结构 / Linux 操作系统 / 德语 / 英语。
// 你可以在页面上继续添加自己的资料，本地新增的内容保存在浏览器里，不会覆盖这份清单。

export interface StudyResource {
  id: string;
  title: string;
  url: string;
  category: string;
  note: string;
}

export const studyResources: StudyResource[] = [
  { id: 'mdn', title: 'MDN Web 文档', url: 'https://developer.mozilla.org/zh-CN/', category: '前端', note: 'HTML / CSS / JavaScript 的权威参考，写页面查属性先来这里。' },
  { id: 'python-tutorial', title: 'Python 官方中文教程', url: 'https://docs.python.org/zh-cn/3/tutorial/', category: '编程', note: '从语法到标准库的官方教程，适合照章节过一遍。' },
  { id: 'cppreference', title: 'cppreference 中文站', url: 'https://zh.cppreference.com/', category: '编程', note: 'C / C++ 标准库速查，比搜索引擎准。' },
  { id: 'visualgo', title: 'VisuAlgo 算法可视化', url: 'https://visualgo.net/zh', category: '算法', note: '排序、树、图这类结构动起来看，比死记代码好懂。' },
  { id: 'leetcode', title: 'LeetCode 力扣', url: 'https://leetcode.cn/', category: '算法', note: '按标签刷题，算法与数据结构课的练习基本都能对上。' },
  { id: 'oi-wiki', title: 'OI Wiki', url: 'https://oi-wiki.org/', category: '算法', note: '数据结构与算法专题整理，复杂度分析讲得很系统。' },
  { id: 'missing-semester', title: 'MIT The Missing Semester（中文）', url: 'https://missing-semester-cn.github.io/', category: '操作系统', note: '命令行、Shell 脚本与 Git 的入门课，配 Linux 课一起看。' },
  { id: 'linux-man', title: 'Linux man 手册', url: 'https://man7.org/linux/man-pages/', category: '操作系统', note: '命令参数含义的最准来源。' },
  { id: 'git-book', title: 'Pro Git 中文版', url: 'https://git-scm.com/book/zh/v2', category: '工具', note: '分支与合并那两章值得反复读，做课程项目也用得上。' },
  { id: 'dw-german', title: 'DW 德语学习', url: 'https://learngerman.dw.com/zh/overview', category: '德语', note: '德国之声的免费课程，A1 起步，带听力练习。' },
  { id: 'leo-dict', title: 'LEO 德英词典', url: 'https://dict.leo.org/german-english/', category: '德语', note: '查词性和固定搭配比普通词典细。' },
  { id: 'bbc-english', title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/', category: '英语', note: '短音频加文本，适合碎片时间练听力。' },
  { id: 'cnmooc', title: '中国大学 MOOC', url: 'https://www.icourse163.org/', category: '课程', note: '找计算机基础公开课，配合课堂进度补课。' },
  { id: 'khan-math', title: 'Khan Academy 数学', url: 'https://zh.khanacademy.org/math', category: '数学', note: '数学 I / II 里卡住的知识点可以回这里补。' },
];