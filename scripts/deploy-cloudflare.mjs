// scripts/deploy-cloudflare.mjs
// One-shot deploy of the site to Cloudflare Pages:
//   1) check / create the Pages project
//   2) write DEEPSEEK_API_KEY into the project's environment variables (the pet chat needs it)
//   3) build the static export (without basePath)
//   4) upload the out/ directory with wrangler
//
// Usage:
//   set CLOUDFLARE_API_TOKEN=xxxxx     (or write the token to .cf-token in the project root, which is gitignored)
//   node scripts/deploy-cloudflare.mjs [project name]

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
  console.error('[x] Cloudflare API Token not found: set CLOUDFLARE_API_TOKEN, or write it to .cf-token in the project root');
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
    console.error('[x] Failed to read accounts:', JSON.stringify(accounts.data.errors || accounts.data).slice(0, 300));
    process.exit(1);
  }
  const accountId = accounts.data.result[0].id;
  console.log(`[1/4] Account: ${accounts.data.result[0].name} (${accountId})`);

  const existing = await api('GET', `/accounts/${accountId}/pages/projects/${PROJECT}`);
  if (existing.status === 404) {
    const created = await api('POST', `/accounts/${accountId}/pages/projects`, {
      name: PROJECT,
      production_branch: 'main',
    });
    if (!created.ok) {
      console.error('[x] Failed to create the Pages project:', JSON.stringify(created.data.errors || created.data).slice(0, 300));
      process.exit(1);
    }
    console.log(`[2/4] Created Pages project ${PROJECT}`);
  } else if (existing.ok) {
    console.log(`[2/4] Pages project already exists: ${PROJECT}`);
  } else {
    console.error('[x] Failed to look up the project:', JSON.stringify(existing.data.errors || existing.data).slice(0, 300));
    process.exit(1);
  }

  const deepseek = readEnvValue(path.join(XH, '.dev.vars'), 'DEEPSEEK_API_KEY') || readEnvValue(path.join(XH, '.env.local'), 'DEEPSEEK_API_KEY');
  if (!deepseek) {
    console.warn('[!] DEEPSEEK_API_KEY not found locally, skipping the environment variable (the pet chat will report that it is not configured)');
  } else {
    const envVars = { DEEPSEEK_API_KEY: { type: 'secret_text', value: deepseek } };
    const patched = await api('PATCH', `/accounts/${accountId}/pages/projects/${PROJECT}`, {
      deployment_configs: { production: { env_vars: envVars }, preview: { env_vars: envVars } },
    });
    console.log(patched.ok ? '[3/4] Wrote the DEEPSEEK_API_KEY environment variable' : `[!] Failed to write the environment variable: ${JSON.stringify(patched.data.errors || patched.data).slice(0, 200)}`);
  }

  console.log('[4/4] Building the static export…');
  const build = spawnSync(path.join(ROOT, 'scripts', 'build-static.cmd'), {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '' },
  });
  if (build.status !== 0) {
    console.error('[x] Build failed');
    process.exit(1);
  }

  console.log('Uploading to Cloudflare Pages…');
  const deploy = spawnSync(
    path.join(ROOT, 'scripts', 'cf.cmd'),
    ['pages', 'deploy', path.join(XH, 'out'), '--project-name', PROJECT, '--branch', 'main', '--commit-dirty=true'],
    { cwd: XH, stdio: 'inherit', shell: true, env: { ...process.env, CLOUDFLARE_API_TOKEN: token } },
  );
  if (deploy.status !== 0) {
    console.error('[x] Upload failed');
    process.exit(1);
  }
  console.log(`\nDone ✅  https://${PROJECT}.pages.dev`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
