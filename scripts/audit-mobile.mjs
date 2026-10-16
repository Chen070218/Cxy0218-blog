// scripts/audit-mobile.mjs
// 手机端体检：用 Edge 的手机视口（390x844，带触摸模拟）打开每个页面，检查
//   - 是否出现横向溢出（内容比屏幕宽）
//   - 是否有元素超出屏幕右侧
//   - 控制台是否报错
//   - 顺便截图存到临时目录，方便肉眼确认
//
// 用法： node scripts/audit-mobile.mjs [起始地址] [截图目录]

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
  console.error('没有找到 Edge');
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
          // 代码块、横滑列表这类本身就该横向滚动的容器不算问题
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
    if (overflow) problems.push([route, `横向溢出：页面宽 ${metrics.scrollWidth}px > 视口 ${metrics.innerWidth}px`]);
    if (metrics.wide.length) problems.push([route, `超出右侧的元素：${metrics.wide.join(' | ')}`]);
    if (consoleErrors.length) problems.push([route, `控制台报错：${consoleErrors[0]}`]);
    if (failedRequests.length) problems.push([route, `请求失败：${[...new Set(failedRequests)].slice(0, 3).join(' | ')}`]);

    const name = (route === '/' ? 'home' : route.replace(/[/]/g, '_').replace(/^_|_$/g, '')) + '.png';
    await page.screenshot({ path: path.join(SHOT_DIR, name), fullPage: false });
    console.log(`${route.padEnd(26)} ${overflow ? '横向溢出' : '宽度正常'}  截图 ${name}`);
  } catch (error) {
    problems.push([route, `打开失败：${error.message}`]);
    console.log(`${route.padEnd(26)} 打开失败`);
  } finally {
    await page.close();
  }
}

await browser.close();

console.log(`\n截图目录：${SHOT_DIR}`);
if (problems.length === 0) {
  console.log('✅ 手机端没有横向溢出、没有元素跑出屏幕、控制台无报错');
} else {
  console.log(`发现 ${problems.length} 处问题：`);
  for (const [route, msg] of problems) console.log(`  ${route} → ${msg}`);
}
process.exit(problems.length ? 1 : 0);
