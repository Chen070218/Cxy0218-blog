// scripts/make-local-package.mjs
// 打一个「本地版」压缩包：解压后双击 启动网站.cmd 就能在老师电脑上跑起来，
// 不需要装 Node，也不需要联网安装依赖（AI 对话功能需要联网）。
//
// 用法： node scripts/make-local-package.mjs

import fs from 'fs';
import path from 'path';
import os from 'os';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const XH = path.join(ROOT, 'XHBlogs');
const DIST = path.join(ROOT, 'dist');
const PKG_NAME = 'cxy0218-本地版';
// 复用上一次的构建产物（调试打包脚本时用）
const SKIP_BUILD = process.argv.includes('--skip-build');
// 含密钥的版本只发给老师本人；公开分享（GitHub Release）必须用 --no-key
const NO_KEY = process.argv.includes('--no-key');
// 两种版本分开输出，避免互相覆盖
const SUFFIX = NO_KEY ? '-无密钥' : '';
const PKG = path.join(DIST, PKG_NAME + SUFFIX);
const SITE = path.join(PKG, 'site');

const rmrf = (target) => fs.rmSync(target, { recursive: true, force: true });
const copyDir = (from, to) => fs.cpSync(from, to, { recursive: true, force: true });

function readEnvValue(file, key) {
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`));
    if (m) return m[1].trim();
  }
  return '';
}

console.log('[1/5] 构建 standalone 版本…' + (SKIP_BUILD ? '（跳过，复用现有产物）' : ''));
if (!SKIP_BUILD) {
  const build = spawnSync(
    process.execPath,
    [path.join(XH, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build', '--webpack'],
    {
      cwd: XH,
      stdio: 'inherit',
      env: { ...process.env, STANDALONE_BUILD: '1', NEXT_TELEMETRY_DISABLED: '1' },
    },
  );
  if (build.status !== 0) {
    console.error('[x] 构建失败');
    process.exit(1);
  }
}

const standalone = path.join(XH, '.next', 'standalone');
if (!fs.existsSync(standalone)) {
  console.error('[x] 没有找到 .next/standalone，构建可能没开启 output: standalone');
  process.exit(1);
}

console.log('[2/5] 组装目录…');
rmrf(PKG);
fs.mkdirSync(DIST, { recursive: true });
copyDir(standalone, SITE);
copyDir(path.join(XH, '.next', 'static'), path.join(SITE, '.next', 'static'));
copyDir(path.join(XH, 'public'), path.join(SITE, 'public'));

// 只保留运行真正需要的东西
for (const junk of [
  path.join(SITE, '.next', 'cache'),
  path.join(SITE, '.next', 'dev'),
  path.join(SITE, 'out'),
  path.join(SITE, '.wrangler'),
  path.join(SITE, 'functions'),
  path.join(SITE, '.dev.vars'),
  path.join(SITE, '.env.local'),
  path.join(SITE, '.env'),
  path.join(SITE, '.env.production'),
  path.join(SITE, 'AGENTS.md'),
  path.join(SITE, 'CLAUDE.md'),
  path.join(SITE, '.env.local.example'),
  path.join(SITE, '.gitignore'),
  path.join(SITE, 'next.config.ts'),
  path.join(SITE, 'postcss.config.mjs'),
  path.join(SITE, 'eslint.config.mjs'),
  path.join(SITE, 'vercel.json'),
]) {
  rmrf(junk);
}

// standalone 会连带把源码目录里的 .env* 复制过来，这里兜底清一遍，
// 之后要不要写密钥完全由上面的 NO_KEY 决定
for (const entry of fs.readdirSync(SITE)) {
  if (entry.startsWith('.env')) rmrf(path.join(SITE, entry));
}

// AI 对话要用的密钥放在 site/.env.local，运行时由 Next 自动读取
const deepseek = NO_KEY ? '' : readEnvValue(path.join(XH, '.env.local'), 'DEEPSEEK_API_KEY') || readEnvValue(path.join(XH, '.dev.vars'), 'DEEPSEEK_API_KEY');
if (deepseek) {
  fs.writeFileSync(path.join(SITE, '.env.local'), `DEEPSEEK_API_KEY=${deepseek}\n`, 'utf8');
}

console.log('[3/5] 复制便携版 Node…');
const nodeExe = path.join(ROOT, 'node', 'node.exe');
let withNode = false;
if (fs.existsSync(nodeExe)) {
  fs.mkdirSync(path.join(PKG, 'node'), { recursive: true });
  fs.copyFileSync(nodeExe, path.join(PKG, 'node', 'node.exe'));
  withNode = true;
}

console.log('[4/5] 写入启动脚本与说明…');
fs.writeFileSync(
  path.join(PKG, '启动网站.cmd'),
  [
    '@echo off',
    'chcp 65001 >nul',
    'cd /d "%~dp0site"',
    'if exist "%~dp0node\\node.exe" set "PATH=%~dp0node;%PATH%"',
    'set "NEXT_TELEMETRY_DISABLED=1"',
    'set "PORT=4322"',
    'set "HOSTNAME=127.0.0.1"',
    'where node >nul 2>nul',
    'if errorlevel 1 (',
    '  echo 没有找到 Node.js：本包内应带有 node\\node.exe，请确认解压完整；',
    '  echo 或者安装 Node.js 20 以上版本后重试。',
    '  pause',
    '  exit /b 1',
    ')',
    'echo.',
    'echo 网站地址：http://127.0.0.1:4322',
    'echo 浏览器会在几秒后自动打开；使用期间请保留这个窗口，关闭窗口即停止网站。',
    'echo.',
    'start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process http://127.0.0.1:4322/"',
    'node server.js',
    'pause',
    '',
  ].join('\r\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(PKG, '使用说明.txt'),
  [
    'cxy0218 个人网站 · 本地版',
    '',
    '【怎么打开】',
    '1. 把整个文件夹解压到任意位置（路径里尽量不要有特殊符号）',
    '2. 双击 启动网站.cmd',
    '3. 等几秒，浏览器会自动打开 http://127.0.0.1:4322',
    '4. 看完直接关闭那个黑色窗口即可（不要关掉浏览器再点别的，窗口关了网站就停了）',
    '',
    '【需不需要装东西】',
    withNode
      ? '不需要。压缩包里已经带了便携版 Node，双击就能跑。'
      : '需要机器上装有 Node.js 20 或更新版本。',
    '',
    '【哪些功能要联网】',
    NO_KEY
      ? '- 右下角桌宠的 AI 对话：这个版本里没有内置 API 密钥，需要在 site\\.env.local 里补一行 DEEPSEEK_API_KEY=你的密钥 才能聊天'
      : '- 右下角桌宠的 AI 对话（调用 DeepSeek 接口）：需要联网',
    '- 首页音乐播放器（代理网易云接口）、首页天气：需要联网',
    '- 其它页面（文章、相册、打卡、番茄钟、课程表、创意工坊等）全部离线可用',
    '',
    '【技术信息】',
    '- 这是 Next.js 16 的生产构建（standalone 模式），和线上站点同一套代码',
    '- 线上地址：https://chen070218.github.io/Cxy0218-blog/',
    '- 源码仓库：https://github.com/Chen070218/Cxy0218-blog',
    '- 想换端口：编辑 启动网站.cmd 里的 PORT',
    '',
    '【注意】',
    NO_KEY
      ? '这个版本不含任何密钥，可以放心公开分享。'
      : 'site\\.env.local 里保存着桌宠对话用的 API 密钥，仅用于本地演示，请不要把这个文件夹上传到公开网盘或公开仓库。',
    '',
  ].join('\r\n'),
  'utf8',
);

console.log('[5/5] 打包 zip…');
const zip = path.join(DIST, `${PKG_NAME}${SUFFIX}.zip`);
rmrf(zip);
writeZip(PKG, zip);

/** 用 Node 自带的 zlib 写 zip：不依赖 tar / Compress-Archive，中文文件名也不会乱码 */
function writeZip(sourceDir, zipPath) {
  const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    return table;
  })();
  const crc32 = (buf) => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };

  const files = [];
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(full, rel);
      else files.push({ full, rel });
    }
  };
  walk(sourceDir, '');

  const chunks = [];
  const central = [];
  let offset = 0;
  const { deflateRawSync } = zlib;

  for (const file of files) {
    const data = fs.readFileSync(file.full);
    const deflated = deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const payload = useDeflate ? deflated : data;
    const nameBuf = Buffer.from(file.rel.replace(/\\/g, '/'), 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // 文件名是 UTF-8
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, nameBuf, payload);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(useDeflate ? 8 : 0, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(0, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(payload.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(nameBuf.length, 28);
    entry.writeUInt16LE(0, 30);
    entry.writeUInt16LE(0, 32);
    entry.writeUInt16LE(0, 34);
    entry.writeUInt16LE(0, 36);
    entry.writeUInt32LE(0, 38);
    entry.writeUInt32LE(offset, 42);

    central.push(entry, nameBuf);
    offset += local.length + nameBuf.length + payload.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  fs.writeFileSync(zipPath, Buffer.concat([...chunks, centralBuf, end]));
  console.log(`  写入 ${files.length} 个文件`);
}

const size = (p) => {
  let total = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else total += fs.statSync(full).size;
    }
  };
  walk(p);
  return (total / 1024 / 1024).toFixed(1);
};

console.log('');
console.log(`完成 ✅`);
console.log(`  文件夹：${PKG}  (${size(PKG)} MB)`);
console.log(`  压缩包：${zip}  (${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`  含便携 Node：${withNode ? '是' : '否'}`);
