/* global __dirname */
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '../assets/avatars');
const OUT = path.resolve(__dirname, '../src/features/profile/data/avatarAssets.ts');

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name.endsWith('.png')) results.push(full);
  }
  return results;
}

const files = walk(BASE);
const lines = [];
lines.push('// Auto-generated — do not edit manually');
lines.push('// Maps asset key to static require() for Metro bundler');
lines.push('');
lines.push('export const avatarAssets: Record<string, number> = {');

for (const f of files) {
  const normalized = f.split(path.sep).join('/');
  const avatarsIdx = normalized.indexOf('/assets/avatars/');
  const fromAvatars = normalized.slice(avatarsIdx + '/assets/avatars/'.length);
  const key = fromAvatars.replace(/\.png$/, '').split('/').join('__');
  // require path relative to src/features/profile/data/
  const requirePath = '../../../../assets/avatars/' + fromAvatars;
  lines.push(`  ${JSON.stringify(key)}: require(${JSON.stringify(requirePath)}),`);
}

lines.push('};');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log('Written', files.length, 'entries to', OUT);
