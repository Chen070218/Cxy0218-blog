// scripts/build-submission.mjs
// Converts dist/submission/project-notes.html into an A4 PDF and saves a "print preview" screenshot for a quick self-check.
//
// Usage: node scripts/build-submission.mjs

import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

const requireFromTools = createRequire(path.join(import.meta.dirname, '..', 'tools', 'package.json'));
const puppeteer = requireFromTools('puppeteer-core');

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'dist', 'submission');
const HTML = path.join(DIR, 'project-notes.html');
const PDF = path.join(DIR, 'cxy0218-project-notes.pdf');
const PREVIEW = path.join(DIR, 'preview-print.png');

if (!fs.existsSync(HTML)) {
  console.error('[x] Not found: ' + HTML);
  process.exit(1);
}

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});

const page = await browser.newPage();
const fileUrl = 'file:///' + HTML.replace(/\\/g, '/').replace(/^\/+/, '');
await page.goto(fileUrl, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// Print preview: mimic the @page margins with body padding, so the screenshot looks like the printed page
const preview = await browser.newPage();
await preview.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
await preview.goto(fileUrl, { waitUntil: 'load' });
await preview.evaluate(() => document.fonts.ready);
await preview.addStyleTag({
  content: `body{width:178mm;margin:0 auto;padding:18mm 16mm 16mm;background:#fff}`,
});
await preview.screenshot({ path: PREVIEW, fullPage: true });

await page.pdf({
  path: PDF,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});

const pages = (fs.readFileSync(PDF).toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
const size = (fs.statSync(PDF).size / 1024).toFixed(0);

await browser.close();

console.log(`PDF: ${PDF}  (${size} KB, about ${pages} pages)`);
console.log(`Preview: ${PREVIEW}`);
