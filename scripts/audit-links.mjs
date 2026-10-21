// scripts/audit-links.mjs
// Link audit: starting from a URL, crawls the pages of this site and checks that every link, image, script and stylesheet on them can be opened.
// Usage: node scripts/audit-links.mjs http://127.0.0.1:4400/Cxy0218-blog/ [max pages]

const start = process.argv[2];
if (!start) {
  console.error('Usage: node scripts/audit-links.mjs <start URL> [max pages]');
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
      /* ignore values that cannot be parsed */
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
      assetStatus.set(link, null); // placeholder, probed later in one pass
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
    return { url, status: 'skip', internal }; // external resources are out of scope
  }),
);

for (const r of results) {
  assetStatus.set(r.url, r.status);
  if (r.internal && r.status !== 200) broken.push({ url: r.url, status: r.status, kind: 'asset' });
}

const external = results.filter((r) => !r.internal).map((r) => r.url);

console.log(`Start page: ${start}`);
console.log(`Pages: ${pageStatus.size}  Internal assets: ${assetList.length - external.length}  External assets: ${external.length}`);
console.log('');

if (broken.length === 0) {
  console.log('✅ Every internal link and asset returned 200');
} else {
  console.log(`❌ ${broken.length} problems:`);
  for (const b of broken) console.log(`  [${b.kind}] ${b.status}  ${b.url}`);
}

if (external.length) {
  console.log('');
  console.log('External resources (not checked):');
  for (const u of external) console.log('  ' + u);
}

process.exit(broken.length ? 1 : 0);
