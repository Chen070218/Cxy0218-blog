// scripts/audit-mobile.mjs
// Mobile audit: opens every page in Edge with a phone viewport (390x844, touch emulation) and checks
//   - whether there is horizontal overflow (content wider than the screen)
//   - whether any element sticks out past the right edge
//   - whether the console reports errors
//   - and it saves a screenshot to a temp directory for eyeballing
//
// Usage: node scripts/audit-mobile.mjs [start URL] [screenshot dir]

import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'node:module';

const requireFromTools = createRequire(path.join(import.meta.dirname, '..', 'tools', 'package.json'));
const puppeteer = requireFromTools('puppeteer-core');

const BASE = process.argv[2] || 'http://127.0.0.1:4400/Cxy0218-blog';
const SHOT_DIR = process.argv[3] || path.join(os.tmpdir(), 'mobile-audit');

const ROUTES = [
  '/',
  '/posts/',
  '/posts/ai-desktop-pet/',
  '/checkin/',
  '/photowall/',
  '/moments/',
  '/courses/',
  '/resources/',
  '/music/',
  '/chatter/',
  '/friends/',
  '/tree/',
  '/timeline/',
  '/about/',
];

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const executablePath = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error('Microsoft Edge not found');
  process.exit(1);
}

fs.mkdirSync(SHOT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

const problems = [];

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 160));
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err).slice(0, 160)));
  page.on('requestfailed', (req) => failedRequests.push(`${req.url()} (${req.failure()?.errorText || 'failed'})`));
  page.on('response', (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.url()} -> ${res.status()}`);
  });

  const url = BASE + route + (route.includes('?') ? '&' : '?') + 'nosplash=1';
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForNetworkIdle({ idleTime: 2500, timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const wide = [];
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > window.innerWidth + 2) {
          const style = getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute') continue;
          // containers that are meant to scroll horizontally (code blocks, swipe lists) are not a problem
          let scrollable = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ps = getComputedStyle(p);
            if (ps.overflowX === 'auto' || ps.overflowX === 'scroll' || ps.overflow === 'auto' || ps.overflow === 'scroll') {
              scrollable = true;
              break;
            }
          }
          if (scrollable) continue;
          wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')} right=${Math.round(rect.right)}`);
        }
      }
      return {
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        wide: [...new Set(wide)].slice(0, 4),
      };
    });

    const overflow = metrics.scrollWidth > metrics.innerWidth + 2;
    if (overflow) problems.push([route, `horizontal overflow: page width ${metrics.scrollWidth}px > viewport ${metrics.innerWidth}px`]);
    if (metrics.wide.length) problems.push([route, `elements past the right edge: ${metrics.wide.join(' | ')}`]);
    if (consoleErrors.length) problems.push([route, `console error: ${consoleErrors[0]}`]);
    if (failedRequests.length) problems.push([route, `failed requests: ${[...new Set(failedRequests)].slice(0, 3).join(' | ')}`]);

    const name = (route === '/' ? 'home' : route.replace(/[/]/g, '_').replace(/^_|_$/g, '')) + '.png';
    await page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
    console.log(`${route.padEnd(26)} ${overflow ? 'OVERFLOW' : 'width ok'}  screenshot ${name}`);
  } catch (error) {
    problems.push([route, `failed to open: ${error.message}`]);
    console.log(`${route.padEnd(26)} failed to open`);
  } finally {
    await page.close();
  }
}

await browser.close();

console.log(`\nScreenshots: ${SHOT_DIR}`);
if (problems.length === 0) {
  console.log('✅ No horizontal overflow, no elements off-screen, no console errors on mobile');
} else {
  console.log(`Found ${problems.length} problems:`);
  for (const [route, msg] of problems) console.log(`  ${route} → ${msg}`);
}
process.exit(problems.length ? 1 : 0);
