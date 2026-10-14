// 🛡️ 本文件由 cxy0218 控制台自动生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    "id": "solaris-journey",
    "title": "索拉里斯漫行",
    "description": "在鸣潮的世界里走一遍：今州的雨、旷野的风，还有旧世界留下的回声。",
    "cover": "https://bu.dusays.com/2026/03/24/69c24230de927.jpg",
    "date": "2026.01",
    "photos": [
      {
        "url": "https://bu.dusays.com/2026/03/31/69cb69bb530d8.jpg",
        "caption": "今州的夜色"
      },
      {
        "url": "https://bu.dusays.com/2026/03/24/69c24230de927.jpg",
        "caption": "残响之上的星空"
      }
    ]
  },
  {
    "id": "echo-collection",
    "title": "声骸随拍",
    "description": "旅途碎片：共鸣者的背影、旷野上的灯塔，还有一路收集的声骸。",
    "cover": "https://bu.dusays.com/2026/03/24/69c24230a4efe.jpg",
    "date": "2025.10",
    "photos": [
      {
        "url": "https://bu.dusays.com/2026/03/24/69c24230a5ff8.jpg",
        "caption": "旷野上的黄昏"
      },
      {
        "url": "https://bu.dusays.com/2026/03/24/69c24230d661d.jpg",
        "caption": "旧城的窄巷"
      },
      {
        "url": "https://bu.dusays.com/2026/03/24/69c24230de927.jpg",
        "caption": "抬头就是星海"
      }
    ]
  }
];