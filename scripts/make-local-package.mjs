// scripts/make-local-package.mjs
// Packs a "local version" zip: after extracting it, double-clicking start-site.cmd runs the site on the teacher's computer,
// with no Node install and no online dependency install (the AI chat still needs a network connection).
//
// Usage: node scripts/make-local-package.mjs

import fs from 'fs';
import path from 'path';
import os from 'os';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const XH = path.join(ROOT, 'XHBlogs');
const DIST = path.join(ROOT, 'dist');
const PKG_NAME = 'cxy0218-local';
// Reuse the previous build (useful when debugging this packaging script)
const SKIP_BUILD = process.argv.includes('--skip-build');
// The build with the key is only for the teacher; public sharing (GitHub Release) must use --no-key
const NO_KEY = process.argv.includes('--no-key');
// The two variants output under different names so they never overwrite each other
const SUFFIX = NO_KEY ? '-no-key' : '';
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

console.log('[1/5] Building the standalone version…' + (SKIP_BUILD ? ' (skipped, reusing the existing build)' : ''));
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
    console.error('[x] Build failed');
    process.exit(1);
  }
}

const standalone = path.join(XH, '.next', 'standalone');
if (!fs.existsSync(standalone)) {
  console.error('[x] .next/standalone not found; the build probably did not enable output: standalone');
  process.exit(1);
}

console.log('[2/5] Assembling the directory…');
rmrf(PKG);
fs.mkdirSync(DIST, { recursive: true });
copyDir(standalone, SITE);
copyDir(path.join(XH, '.next', 'static'), path.join(SITE, '.next', 'static'));
copyDir(path.join(XH, 'public'), path.join(SITE, 'public'));

// Keep only what is really needed at runtime
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

// standalone also copies the .env* files from the source directory, so clean them up here as a safety net;
// whether a key is written afterwards is decided entirely by NO_KEY above
for (const entry of fs.readdirSync(SITE)) {
  if (entry.startsWith('.env')) rmrf(path.join(SITE, entry));
}

// The key used by the AI chat goes into site/.env.local, where Next reads it automatically at runtime
const deepseek = NO_KEY ? '' : readEnvValue(path.join(XH, '.env.local'), 'DEEPSEEK_API_KEY') || readEnvValue(path.join(XH, '.dev.vars'), 'DEEPSEEK_API_KEY');
if (deepseek) {
  fs.writeFileSync(path.join(SITE, '.env.local'), `DEEPSEEK_API_KEY=${deepseek}\n`, 'utf8');
}

console.log('[3/5] Copying the portable Node…');
const nodeExe = path.join(ROOT, 'node', 'node.exe');
let withNode = false;
if (fs.existsSync(nodeExe)) {
  fs.mkdirSync(path.join(PKG, 'node'), { recursive: true });
  fs.copyFileSync(nodeExe, path.join(PKG, 'node', 'node.exe'));
  withNode = true;
}

console.log('[4/5] Writing the launcher and instructions…');
fs.writeFileSync(
  path.join(PKG, 'start-site.cmd'),
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
    '  echo Node.js not found: this package should include node\\node.exe, so check that the archive was extracted completely;',
    '  echo or install Node.js 20 or newer and try again.',
    '  pause',
    '  exit /b 1',
    ')',
    'echo.',
    'echo Site URL: http://127.0.0.1:4322',
    'echo The browser will open in a few seconds. Keep this window open while you use the site; closing it stops the site.',
    'echo.',
    'start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process http://127.0.0.1:4322/"',
    'node server.js',
    'pause',
    '',
  ].join('\r\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(PKG, 'start-site-lan.cmd'),
  [
    '@echo off',
    'chcp 65001 >nul',
    'rem Phone access on the same Wi-Fi: run allow-phone-access.cmd once first.',
    'cd /d "%~dp0site"',
    'if exist "%~dp0node\\node.exe" set "PATH=%~dp0node;%PATH%"',
    'set "NEXT_TELEMETRY_DISABLED=1"',
    'set "PORT=4322"',
    'set "HOSTNAME=0.0.0.0"',
    'echo.',
    'echo This computer:   http://127.0.0.1:4322',
    'echo Phone, same Wi-Fi: use one of these IPv4 addresses with :4322',
    'echo ------------------------------------------------------------',
    'ipconfig | findstr /i "IPv4"',
    'echo ------------------------------------------------------------',
    'echo Example: http://10.47.3.34:4322',
    'echo Keep this window open while using the site.',
    'echo.',
    'node server.js',
    'pause',
    '',
  ].join('\r\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(PKG, 'allow-phone-access.cmd'),
  [
    '@echo off',
    'chcp 65001 >nul',
    'echo Requesting administrator rights to open TCP 4322 for phone access...',
    'powershell -NoProfile -Command "Start-Process cmd -Verb RunAs -ArgumentList \'/c\',\'netsh advfirewall firewall add rule name=\\"XinghuiBlog 4322\\" dir=in action=allow protocol=TCP localport=4322 && echo. && echo Port 4322 is open. Run start-site-lan.cmd, then open the IPv4 address from the phone. && pause\'"',
    'pause',
    '',
  ].join('\r\n'),
  'utf8',
);

fs.writeFileSync(
  path.join(PKG, 'README.txt'),
  [
    'cxy0218 personal website · local version',
    '',
    '[How to open it]',
    '1. Extract the whole folder anywhere (avoid special characters in the path)',
    '2. Double-click start-site.cmd',
    '3. Wait a few seconds; the browser opens http://127.0.0.1:4322 automatically',
    '4. When you are done, just close that black window (do not close the browser and keep clicking around: closing the window stops the site)',
    '',
    '[Phone on the same Wi-Fi]',
    '1. Double-click allow-phone-access.cmd and click "Yes" (opens TCP 4322 once)',
    '2. Double-click start-site-lan.cmd; it prints this computer\'s IPv4 address',
    '3. On the phone, open http://THAT-IPv4:4322 (for example http://10.47.3.34:4322)',
    '',
    '[Do I need to install anything]',
    withNode
      ? 'No. The archive already includes a portable Node, so a double-click is enough.'
      : 'The machine needs Node.js 20 or newer.',
    '',
    '[What needs a network connection]',
    NO_KEY
      ? '- The desktop pet\'s AI chat in the bottom-right corner: this version has no built-in API key, so add a line DEEPSEEK_API_KEY=your-key to site\\.env.local before it can chat'
      : '- The desktop pet\'s AI chat in the bottom-right corner (calls the DeepSeek API): needs a network connection',
    '- The music player on the home page (proxies the NetEase Cloud Music API) and the weather widget: need a network connection',
    '- Everything else (posts, photo albums, check-in, Pomodoro timer, timetable, Creative Workshop, ...) works offline',
    '',
    '[Technical information]',
    '- This is the Next.js 16 production build (standalone mode), built from the same code as the live site',
    '- Live site: https://cxy0218-blog.pages.dev/ (mirror: https://chen070218.github.io/Cxy0218-blog/)',
    '- Source repository: https://github.com/Chen070218/Cxy0218-blog',
    '- To change the port: edit PORT in start-site.cmd',
    '',
    '[Note]',
    NO_KEY
      ? 'This version contains no keys, so it is safe to share publicly.'
      : 'site\\.env.local holds the API key used by the pet chat. It is for local demos only; do not upload this folder to a public cloud drive or a public repository.',
    '',
  ].join('\r\n'),
  'utf8',
);

console.log('[5/5] Packing the zip…');
const zip = path.join(DIST, `${PKG_NAME}${SUFFIX}.zip`);
rmrf(zip);
writeZip(PKG, zip);

/** Writes the zip with Node's built-in zlib: no dependency on tar / Compress-Archive, and file names are not garbled */
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
    local.writeUInt16LE(0x0800, 6); // file names are UTF-8
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
  console.log(`  wrote ${files.length} files`);
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
console.log(`Done ✅`);
console.log(`  Folder: ${PKG}  (${size(PKG)} MB)`);
console.log(`  Archive: ${zip}  (${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`  Portable Node included: ${withNode ? 'yes' : 'no'}`);
