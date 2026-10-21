// scripts/check-nav.mjs
// Checks whether clicking an internal link triggers a client-side navigation (fast) or a full page reload (slow).
// With a static export, the naming of the RSC data Next needs to prefetch is off, which turns clicks into full page loads.
//
// Usage: node scripts/check-nav.mjs [site URL]

import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

const requireFromTools = createRequire(path.join(import.meta.dirname, '..', 'tools', 'package.json'));
const puppeteer = requireFromTools('puppeteer-core');

const BASE = (process.argv[2] || 'https://chen070218.github.io/Cxy0218-blog').replace(/\/$/, '');
const EDGE = ['C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const requests = [];
page.on('request', (req) => requests.push({ url: req.url(), type: req.resourceType() }));
page.on('response', (res) => {
  if (res.status() >= 400) console.log(`  ✗ ${res.status()}  ${res.url().slice(0, 120)}`);
});

const cases = [
  { name: 'Home → Archive', from: '/', selector: 'a[href$="/posts/"]' },
  { name: 'Archive → Post', from: '/posts/', selector: 'a[href*="/posts/"]' },
  { name: 'Home → Check-in', from: '/', selector: 'a[href$="/checkin/"]' },
];

for (const c of cases) {
  requests.length = 0;
  await page.goto(BASE + c.from + '?nosplash=1', { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const found = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    el.scrollIntoView();
    return el.getAttribute('href');
  }, c.selector);

  if (!found) {
    console.log(`${c.name}: link not found ${c.selector}`);
    continue;
  }

  const before = requests.length;
  const start = Date.now();
  await page.click(c.selector).catch(async () => {
    await page.evaluate((sel) => document.querySelector(sel).click(), c.selector);
  });
  await page.waitForFunction(() => document.querySelector('h1')?.innerText?.length > 0, { timeout: 30000 }).catch(() => {});
  const ms = Date.now() - start;

  const during = requests.slice(before);
  const documentLoads = during.filter((r) => r.type === 'document');
  const rsc = during.filter((r) => r.url.includes('_rsc=') || r.url.endsWith('.txt'));
  console.log(
    `${c.name} (${found}): ${ms}ms  full page requests ${documentLoads.length}  RSC data requests ${rsc.length}  → ${
      documentLoads.length > 0 ? 'full page reload (slower)' : 'client-side navigation (fast)'
    }`,
  );
}

await browser.close();
