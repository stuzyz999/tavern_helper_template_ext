/**
 * release.mjs — 打包 + 自动递增 patch 版本 + 打 git tag + 推送
 *
 * 用法：
 *   node release.mjs          # patch 递增 (1.0.0 → 1.0.1)
 *   node release.mjs minor    # minor 递增 (1.0.0 → 1.1.0)
 *   node release.mjs major    # major 递增 (1.0.0 → 2.0.0)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VERSION_FILE = path.join(import.meta.dirname, 'version.txt');

// ─── 读取当前版本 ───
function readVersion() {
  if (fs.existsSync(VERSION_FILE)) {
    return fs.readFileSync(VERSION_FILE, 'utf-8').trim();
  }
  return '1.0.0';
}

// ─── 递增版本号 ───
function bumpVersion(current, type = 'patch') {
  const [major, minor, patch] = current.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function run(cmd) {
  console.log(`\x1b[36m>\x1b[0m ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: import.meta.dirname });
}

const bumpType = process.argv[2] || 'patch';
const current = readVersion();
const next = bumpVersion(current, bumpType);
const tag = `v${next}`;

console.log(`\n\x1b[33m版本: ${current} → ${next}\x1b[0m\n`);

// 1. 打包
run('pnpm build');

// 2. 写入新版本号
fs.writeFileSync(VERSION_FILE, next + '\n', 'utf-8');
console.log(`\x1b[32m✓ 版本号已写入 version.txt\x1b[0m`);

// 3. git add + commit + tag + push
run('git add -A');
run(`git commit -m "release: ${tag}"`);
run(`git tag ${tag}`);
run('git push');
run(`git push origin ${tag}`);

console.log(`
\x1b[32m✓ 发布完成！\x1b[0m

jsDelivr URL:
  https://testingcf.jsdelivr.net/gh/stuzyz999/xjss@${tag}/index.js

记得把 card.json 里的脚本 URL 版本号改为 ${tag}
`);
