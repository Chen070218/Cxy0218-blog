// scripts/audit-a11y.mjs
// Accessibility / semantics audit: reads the HTML files in the static export directory and checks
//   - whether <html lang> is present
//   - whether each page has exactly one <h1>
//   - whether heading levels skip (h1 -> h3)
//   - whether every <img> has alt
//   - whether every <a> has readable text (or an aria-label)
//   - whether button-like interactive elements are missing an accessible name
//
// Usage: node scripts/audit-a11y.mjs [out dir]

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

  if (!/<html[^>]*\slang="/i.test(html)) problems.push([rel, 'missing <html lang>']);

  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/gi)];
  if (h1s.length === 0) problems.push([rel, 'no <h1>']);
  if (h1s.length > 1) problems.push([rel, `${h1s.length} <h1> elements`]);

  const headings = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      problems.push([rel, `heading level jump: h${headings[i - 1]} -> h${headings[i]}`]);
      break;
    }
  }

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=("|')/i.test(img[0])) {
      problems.push([rel, `image missing alt: ${img[0].slice(0, 80)}`]);
      break;
    }
  }

  for (const link of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = link[0];
    if (/aria-label=|<img|role="button"/i.test(tag)) continue;
    if (!stripTags(tag)) {
      problems.push([rel, `link has no readable text: ${tag.slice(0, 80)}`]);
      break;
    }
  }

  for (const button of html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/gi)) {
    const tag = button[0];
    if (/aria-label=|title=/i.test(tag)) continue;
    if (!stripTags(tag)) {
      problems.push([rel, `button has no accessible name: ${tag.slice(0, 80)}`]);
      break;
    }
  }
}

console.log(`Checked ${pages.length} pages (${dir})`);
if (problems.length === 0) {
  console.log('✅ No problems found: every page has lang, a single h1, no skipped heading levels, alt text on images, and readable names on links and buttons');
} else {
  console.log(`Found ${problems.length} problems:`);
  for (const [page, msg] of problems) console.log(`  ${page}  →  ${msg}`);
}
process.exit(problems.length ? 1 : 0);
