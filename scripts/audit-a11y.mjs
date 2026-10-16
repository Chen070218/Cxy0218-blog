// scripts/audit-a11y.mjs
// 可访问性/语义体检：直接读静态导出目录里的 HTML，检查
//   - <html lang> 是否存在
//   - 每页是否有且仅有一个 <h1>
//   - 标题层级有没有跳级（h1 -> h3）
//   - <img> 是否都有 alt
//   - <a> 是否有可读文字（或 aria-label）
//   - 按钮类交互元素是否缺少可访问名称
//
// 用法： node scripts/audit-a11y.mjs [out 目录]

import fs from 'fs';
import path from 'path';

const dir = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..', 'XHBlogs', 'out'));

function walk(current, files = []) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const stripTags = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

const problems = [];
const pages = walk(dir);

for (const file of pages) {
  const rel = path.relative(dir, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  if (!/<html[^>]*\slang="/i.test(html)) problems.push([rel, '缺少 <html lang>']);

  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/gi)];
  if (h1s.length === 0) problems.push([rel, '没有 <h1>']);
  if (h1s.length > 1) problems.push([rel, `有 ${h1s.length} 个 <h1>`]);

  const headings = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      problems.push([rel, `标题层级跳跃：h${headings[i - 1]} -> h${headings[i]}`]);
      break;
    }
  }

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=("|')/i.test(img[0])) {
      problems.push([rel, `图片缺少 alt：${img[0].slice(0, 80)}`]);
      break;
    }
  }

  for (const link of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = link[0];
    if (/aria-label=|<img|role="button"/i.test(tag)) continue;
    if (!stripTags(tag)) {
      problems.push([rel, `链接没有可读文字：${tag.slice(0, 80)}`]);
      break;
    }
  }

  for (const button of html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)) {
    const tag = button[0];
    if (/aria-label=|title=/i.test(tag)) continue;
    if (!stripTags(tag)) {
      problems.push([rel, `按钮没有可访问名称：${tag.slice(0, 80)}`]);
      break;
    }
  }
}

console.log(`检查了 ${pages.length} 个页面（${dir}）`);
if (problems.length === 0) {
  console.log('✅ 没有发现问题：每页有 lang、唯一 h1、标题不跳级、图片有 alt、链接与按钮有可读名称');
} else {
  console.log(`发现 ${problems.length} 处：`);
  for (const [page, msg] of problems) console.log(`  ${page}  →  ${msg}`);
}
process.exit(problems.length ? 1 : 0);
