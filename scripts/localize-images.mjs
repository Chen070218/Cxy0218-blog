// scripts/localize-images.mjs
// 把站内引用的外部图片（旧图床 bu.dusays.com）下载、压缩成 WebP 放进 public/photos/，
// 再把源码里的链接换成站内路径。相册里的原图单张 1MB 上下，压缩后只有一两百 KB。
//
// 用法： node scripts/localize-images.mjs [--dry]

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'node:module';

const ROOT = path.resolve(import.meta.dirname, '..');
const XH = path.join(ROOT, 'XHBlogs');
const OUT_DIR = path.join(XH, 'public', 'photos');
const DRY = process.argv.includes('--dry');

// sharp 装在 XHBlogs/node_modules 里，从那边解析
const requireFromSite = createRequire(path.join(XH, 'package.json'));
const sharp = requireFromSite('sharp');

/** 需要扫描的文件：相册数据、说说、站点配置 */
function collectFiles() {
  const files = [
    path.join(XH, 'siteConfig.ts'),
    path.join(XH, 'data', 'albums.ts'),
    path.join(XH, 'data', 'friends.ts'),
    path.join(XH, 'data', 'projects.ts'),
    path.join(XH, 'data', 'resources.ts'),
    path.join(XH, 'app', 'about', 'about.md'),
    path.join(XH, 'app', 'about', 'page.tsx'),
  ];
  for (const dir of ['moments', 'posts', 'chatters']) {
    const full = path.join(XH, dir);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full)) if (f.endsWith('.md')) files.push(path.join(full, f));
  }
  return files.filter((f) => fs.existsSync(f));
}

const URL_RE = /https?:\/\/bu\.dusays\.com\/[^\s"'`)<>]+/g;

async function main() {
  const files = collectFiles();
  const urls = new Set();
  const contents = new Map();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    contents.set(file, text);
    for (const m of text.matchAll(URL_RE)) urls.add(m[0]);
  }

  console.log(`扫描到 ${urls.size} 张外部图片，来自 ${files.length} 个文件`);
  if (DRY) {
    for (const u of urls) console.log('  ' + u);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const mapping = new Map();
  let index = 0;

  for (const url of urls) {
    index++;
    const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12) + '.webp';
    const target = path.join(OUT_DIR, name);
    try {
      if (!fs.existsSync(target)) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const before = buf.length;
        const out = await sharp(buf)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78 })
          .toBuffer();
        fs.writeFileSync(target, out);
        console.log(`[${index}/${urls.size}] ${name}  ${(before / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`);
      } else {
        console.log(`[${index}/${urls.size}] ${name} 已存在，跳过下载`);
      }
      mapping.set(url, `/photos/${name}`);
    } catch (error) {
      console.log(`[${index}/${urls.size}] 失败 ${url} -> ${error.message}`);
    }
  }

  let changed = 0;
  for (const [file, text] of contents) {
    let next = text;
    for (const [url, local] of mapping) next = next.split(url).join(local);
    if (next !== text) {
      fs.writeFileSync(file, next);
      changed++;
      console.log(`改写 ${path.relative(ROOT, file)}`);
    }
  }
  console.log(`完成：本地化 ${mapping.size} 张，改写 ${changed} 个文件`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
