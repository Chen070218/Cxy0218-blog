// scripts/deploy-cloudflare.mjs
// 一键把站点发布到 Cloudflare Pages：
//   1) 检查/创建 Pages 项目
//   2) 把 DEEPSEEK_API_KEY 写进项目的环境变量（桌宠对话要用）
//   3) 静态导出构建（不带 basePath）
//   4) 用 wrangler 上传 out/ 目录
//
// 用法：
//   set CLOUDFLARE_API_TOKEN=xxxxx     （或把令牌写进项目根目录的 .cf-token，已被 gitignore）
//   node scripts/deploy-cloudflare.mjs [项目名]

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const XH = path.join(ROOT, 'XHBlogs');
const PROJECT = process.argv[2] || process.env.CF_PROJECT || 'cxy0218-blog';

function readEnvValue(file, key) {
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

const token =
  process.env.CLOUDFLARE_API_TOKEN ||
  (fs.existsSync(path.join(ROOT, '.cf-token')) ? fs.readFileSync(path.join(ROOT, '.cf-token'), 'utf8').trim() : '');

if (!token) {
  console.error('[x] 没有找到 Cloudflare API Token：请设置 CLOUDFLARE_API_TOKEN，或写到项目根目录的 .cf-token');
  process.exit(1);
}

const api = async (method, endpoint, body) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
};

async function main() {
  const accounts = await api('GET', '/accounts?per_page=50');
  if (!accounts.ok || !accounts.data.result?.length) {
    console.error('[x] 读取账号失败：', JSON.stringify(accounts.data.errors || accounts.data).slice(0, 300));
    process.exit(1);
  }
  const accountId = accounts.data.result[0].id;
  console.log(`[1/4] 账号：${accounts.data.result[0].name} (${accountId})`);

  const existing = await api('GET', `/accounts/${accountId}/pages/projects/${PROJECT}`);
  if (existing.status === 404) {
    const created = await api('POST', `/accounts/${accountId}/pages/projects`, {
      name: PROJECT,
      production_branch: 'main',
    });
    if (!created.ok) {
      console.error('[x] 创建 Pages 项目失败：', JSON.stringify(created.data.errors || created.data).slice(0, 300));
      process.exit(1);
    }
    console.log(`[2/4] 已创建 Pages 项目 ${PROJECT}`);
  } else if (existing.ok) {
    console.log(`[2/4] Pages 项目已存在：${PROJECT}`);
  } else {
    console.error('[x] 查询项目失败：', JSON.stringify(existing.data.errors || existing.data).slice(0, 300));
    process.exit(1);
  }

  const deepseek = readEnvValue(path.join(XH, '.dev.vars'), 'DEEPSEEK_API_KEY') || readEnvValue(path.join(XH, '.env.local'), 'DEEPSEEK_API_KEY');
  if (!deepseek) {
    console.warn('[!] 本地没有找到 DEEPSEEK_API_KEY，跳过环境变量写入（桌宠对话会提示未配置）');
  } else {
    const envVars = { DEEPSEEK_API_KEY: { type: 'secret_text', value: deepseek } };
    const patched = await api('PATCH', `/accounts/${accountId}/pages/projects/${PROJECT}`, {
      deployment_configs: { production: { env_vars: envVars }, preview: { env_vars: envVars } },
    });
    console.log(patched.ok ? '[3/4] 已写入 DEEPSEEK_API_KEY 环境变量' : `[!] 写入环境变量失败：${JSON.stringify(patched.data.errors || patched.data).slice(0, 200)}`);
  }

  console.log('[4/4] 开始静态导出构建…');
  const build = spawnSync(path.join(ROOT, 'scripts', 'build-static.cmd'), {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '' },
  });
  if (build.status !== 0) {
    console.error('[x] 构建失败');
    process.exit(1);
  }

  console.log('上传到 Cloudflare Pages…');
  const deploy = spawnSync(
    path.join(ROOT, 'scripts', 'cf.cmd'),
    ['pages', 'deploy', path.join(XH, 'out'), '--project-name', PROJECT, '--branch', 'main', '--commit-dirty=true'],
    { cwd: XH, stdio: 'inherit', shell: true, env: { ...process.env, CLOUDFLARE_API_TOKEN: token } },
  );
  if (deploy.status !== 0) {
    console.error('[x] 上传失败');
    process.exit(1);
  }
  console.log(`\n完成 ✅  https://${PROJECT}.pages.dev`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
