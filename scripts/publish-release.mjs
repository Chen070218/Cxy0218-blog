// scripts\publish-release.mjs
// Publishes the packed local-version zip as a GitHub Release asset, so the download link can be sent straight to the teacher.
//
// Usage: node scripts/publish-release.mjs [tag] [zip path] [asset name]
// Token source: the GITHUB_TOKEN environment variable, or .gh-token in the project root (gitignored)

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPO = process.env.GITHUB_REPO || 'Chen070218/Cxy0218-blog';
const TAG = process.argv[2] || 'v1.0.0';
const ZIP = path.resolve(process.argv[3] || path.join(ROOT, 'dist', 'cxy0218-local-no-key.zip'));
const ASSET_NAME = process.argv[4] || 'cxy0218-local-demo.zip';

const tokenFile = path.join(ROOT, '.gh-token');
const token = process.env.GITHUB_TOKEN || (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');
if (!token) {
  console.error('[x] GitHub token not found (GITHUB_TOKEN environment variable or .gh-token)');
  process.exit(1);
}
if (!fs.existsSync(ZIP)) {
  console.error(`[x] File not found: ${ZIP}`);
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'User-Agent': 'codex',
  Accept: 'application/vnd.github+json',
};

const json = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

const NOTES = `## cxy0218 personal website · local run package

After extracting, double-click \`start-site.cmd\` and the browser opens http://127.0.0.1:4322 . The package **includes a portable Node**, so the target machine needs no environment installed.

- Online version: https://chen070218.github.io/Cxy0218-blog/
- Source and commit history: this repository (\`XHBlogs/\` is the site itself, \`my-blog-manager/\` is the local management console)
- Full instructions: \`README.txt\` in the package

**This package contains no API keys**, so the pet's AI chat is unavailable by default (it needs a network connection, plus a line \`DEEPSEEK_API_KEY=your-key\` in \`site\\.env.local\`). Posts, images, photo albums, check-in, Pomodoro timer, timetable, Creative Workshop and so on all work offline.

Repack: \`node scripts/make-local-package.mjs --no-key\`
`;

console.log(`[1/3] Looking up Release ${TAG}…`);
let release = null;
const existing = await json('GET', `https://api.github.com/repos/${REPO}/releases/tags/${TAG}`);
if (existing.ok) {
  release = existing.data;
  console.log(`      Existing: ${release.html_url}`);
  const patched = await json('PATCH', `https://api.github.com/repos/${REPO}/releases/${release.id}`, {
    name: release.name,
    body: NOTES,
  });
  if (patched.ok) release = patched.data;
} else {
  console.log('      Creating Release…');
  const created = await json('POST', `https://api.github.com/repos/${REPO}/releases`, {
    tag_name: TAG,
    name: 'cxy0218 personal website · local run package (no install)',
    body: NOTES,
    draft: false,
    prerelease: false,
  });
  if (!created.ok) {
    console.error('[x] Failed to create the Release:', JSON.stringify(created.data.errors || created.data).slice(0, 300));
    process.exit(1);
  }
  release = created.data;
  console.log(`      Created: ${release.html_url}`);
}

const existingAsset = (release.assets || []).find((a) => a.name === ASSET_NAME);
if (existingAsset) {
  console.log(`[2/3] Deleting the old asset with the same name ${ASSET_NAME}…`);
  await json('DELETE', `https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`);
}

const buf = fs.readFileSync(ZIP);
console.log(`[2/3] Uploading ${ASSET_NAME} (${(buf.length / 1024 / 1024).toFixed(1)} MB)…`);

let uploaded = null;
for (let attempt = 1; attempt <= 3 && !uploaded; attempt++) {
  const started = Date.now();
  try {
    const res = await fetch(
      `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(ASSET_NAME)}`,
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/zip', 'Content-Length': String(buf.length) },
        body: buf,
        signal: AbortSignal.timeout(1800000),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      uploaded = data;
      console.log(`      Uploaded in ${((Date.now() - started) / 1000).toFixed(0)}s`);
    } else {
      console.error(`      Attempt ${attempt} failed: ${res.status} ${JSON.stringify(data.errors || data).slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`      Attempt ${attempt} error: ${error.message}`);
  }
  if (!uploaded) await new Promise((r) => setTimeout(r, 5000));
}

if (!uploaded) {
  console.error('[x] Asset upload failed (on a network problem, rerun this script later)');
  process.exit(1);
}

console.log('[3/3] Done ✅');
console.log(`  Release page: ${release.html_url}`);
console.log(`  Direct download: ${uploaded.browser_download_url}`);
