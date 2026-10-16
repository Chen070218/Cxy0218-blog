// scripts/audit-links.mjs
// 链接体检：从起始地址出发遍历站内页面，检查页面里出现的每个链接/图片/脚本/样式表能不能打开。
// 用法： node scripts/audit-links.mjs http://127.0.0.1:4400/Cxy0218-blog/ [最多页面数]

const start = process.argv[2];
if (!start) {
  console.error('用法：node scripts/audit-links.mjs <起始地址> [最多页面数]');
  process.exit(2);
}

const maxPages = Number(process.argv[3] || 40);
const startUrl = new URL(start);
const origin = startUrl.origin;
const prefix = startUrl.pathname.replace(/[^/]*$/, '');

const pageStatus = new Map();
const assetStatus = new Map();
const broken = [];
const seen = new Set();
const queue = [startUrl.href];

const unescapeHtml = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

function extractUrls(html, pageUrl) {
  const found = new Set();
  const re = /(?:href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = unescapeHtml(m[2] ?? m[3] ?? '').trim();
    if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) continue;
    try {
      found.add(new URL(raw, pageUrl).href);
    } catch {
      /* 忽略无法解析的写法 */
    }
  }
  return found;
}

const isPageUrl = (raw) => {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  const last = u.pathname.split('/').pop() || '';
  return (
    u.origin === origin &&
    u.pathname.startsWith(prefix) &&
    (u.pathname.endsWith('/') || !last.includes('.'))
  );
};

async function probe(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    return { status: res.status, type: res.headers.get('content-type') || '' };
  } catch (error) {
    return { status: 'ERR', type: String(error?.message || error) };
  }
}

while (queue.length && pageStatus.size < maxPages) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);

  const res = await probe(url);
  pageStatus.set(url, res.status);
  if (res.status !== 200) {
    broken.push({ url, status: res.status, kind: 'page' });
    continue;
  }

  const html = await fetch(url, { signal: AbortSignal.timeout(20000) })
    .then((r) => r.text())
    .catch(() => '');
  for (const link of extractUrls(html, url)) {
    if (isPageUrl(link)) {
      if (!seen.has(link) && !queue.includes(link)) queue.push(link);
    } else if (!assetStatus.has(link)) {
      assetStatus.set(link, null); // 占位，稍后统一探测
    }
  }
}

const assetList = [...assetStatus.keys()];
const results = await Promise.all(
  assetList.map(async (url) => {
    const internal = url.startsWith(origin);
    if (internal) {
      const r = await probe(url);
      return { url, status: r.status, internal };
    }
    return { url, status: 'skip', internal }; // 外部资源不在体检范围内
  }),
);

for (const r of results) {
  assetStatus.set(r.url, r.status);
  if (r.internal && r.status !== 200) broken.push({ url: r.url, status: r.status, kind: 'asset' });
}

const external = results.filter((r) => !r.internal).map((r) => r.url);

console.log(`起始页：${start}`);
console.log(`页面：${pageStatus.size} 个  站内资源：${assetList.length - external.length} 个  外部资源：${external.length} 个`);
console.log('');

if (broken.length === 0) {
  console.log('✅ 所有站内链接与资源都返回 200');
} else {
  console.log(`❌ 有 ${broken.length} 个问题：`);
  for (const b of broken) console.log(`  [${b.kind}] ${b.status}  ${b.url}`);
}

if (external.length) {
  console.log('');
  console.log('外部资源（不做检查）：');
  for (const u of external) console.log('  ' + u);
}

process.exit(broken.length ? 1 : 0);
