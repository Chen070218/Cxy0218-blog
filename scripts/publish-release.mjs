// scripts\publish-release.mjs
// 把打包好的本地版 zip 作为 GitHub Release 附件发布，方便直接把下载链接发给老师。
//
// 用法： node scripts/publish-release.mjs [标签] [zip路径] [附件名]
// 令牌来源：环境变量 GITHUB_TOKEN，或项目根目录的 .gh-token（已被 gitignore）

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const REPO = process.env.GITHUB_REPO || 'Chen070218/Cxy0218-blog';
const TAG = process.argv[2] || 'v1.0.0';
const ZIP = path.resolve(process.argv[3] || path.join(ROOT, 'dist', 'cxy0218-本地版-无密钥.zip'));
const ASSET_NAME = process.argv[4] || 'cxy0218-local-demo.zip';

const tokenFile = path.join(ROOT, '.gh-token');
const token = process.env.GITHUB_TOKEN || (fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8').trim() : '');
if (!token) {
  console.error('[x] 没有找到 GitHub 令牌（环境变量 GITHUB_TOKEN 或 .gh-token）');
  process.exit(1);
}
if (!fs.existsSync(ZIP)) {
  console.error(`[x] 找不到文件：${ZIP}`);
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

const NOTES = `## cxy0218 个人网站 · 本地运行版

解压后双击 \`启动网站.cmd\`，浏览器会自动打开 http://127.0.0.1:4322 。包内**已内置便携版 Node**，目标机器不需要安装任何环境。

- 在线版本：https://chen070218.github.io/Cxy0218-blog/
- 源码与提交历史：本仓库（\`XHBlogs/\` 是站点主体，\`my-blog-manager/\` 是本地管理控制台）
- 详细说明见包内 \`使用说明.txt\`

**这个包不含任何 API 密钥**，所以桌宠的 AI 对话默认不可用（需要联网，并在 \`site\\.env.local\` 里补一行 \`DEEPSEEK_API_KEY=自己的密钥\`）。文章、图片、相册、打卡、番茄钟、课程表、创意工坊等全部离线可用。

重新打包：\`node scripts/make-local-package.mjs --no-key\`
`;

console.log(`[1/3] 查找 Release ${TAG}…`);
let release = null;
const existing = await json('GET', `https://api.github.com/repos/${REPO}/releases/tags/${TAG}`);
if (existing.ok) {
  release = existing.data;
  console.log(`      已存在：${release.html_url}`);
  const patched = await json('PATCH', `https://api.github.com/repos/${REPO}/releases/${release.id}`, {
    name: release.name,
    body: NOTES,
  });
  if (patched.ok) release = patched.data;
} else {
  console.log('      新建 Release…');
  const created = await json('POST', `https://api.github.com/repos/${REPO}/releases`, {
    tag_name: TAG,
    name: 'cxy0218 个人网站 · 本地运行版（免安装）',
    body: NOTES,
    draft: false,
    prerelease: false,
  });
  if (!created.ok) {
    console.error('[x] 创建 Release 失败：', JSON.stringify(created.data.errors || created.data).slice(0, 300));
    process.exit(1);
  }
  release = created.data;
  console.log(`      已创建：${release.html_url}`);
}

const existingAsset = (release.assets || []).find((a) => a.name === ASSET_NAME);
if (existingAsset) {
  console.log(`[2/3] 删除同名旧附件 ${ASSET_NAME}…`);
  await json('DELETE', `https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`);
}

const buf = fs.readFileSync(ZIP);
console.log(`[2/3] 上传 ${ASSET_NAME}（${(buf.length / 1024 / 1024).toFixed(1)} MB）…`);

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
      console.log(`      上传成功，用时 ${((Date.now() - started) / 1000).toFixed(0)}s`);
    } else {
      console.error(`      第 ${attempt} 次失败：${res.status} ${JSON.stringify(data.errors || data).slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`      第 ${attempt} 次异常：${error.message}`);
  }
  if (!uploaded) await new Promise((r) => setTimeout(r, 5000));
}

if (!uploaded) {
  console.error('[x] 附件上传失败（网络问题可稍后重跑本脚本）');
  process.exit(1);
}

console.log('[3/3] 完成 ✅');
console.log(`  Release 页面：${release.html_url}`);
console.log(`  直接下载：${uploaded.browser_download_url}`);
