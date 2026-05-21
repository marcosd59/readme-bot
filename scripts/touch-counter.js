const fs = require('fs');
const path = require('path');

const COUNTER_PATH = path.join(__dirname, '..', 'counter.json');
const README_PATH = path.join(__dirname, '..', 'README.md');

let counter = { total: 0, lastBump: null };
if (fs.existsSync(COUNTER_PATH)) {
  counter = JSON.parse(fs.readFileSync(COUNTER_PATH, 'utf8'));
}

counter.total += 1;
counter.lastBump = new Date().toISOString();

fs.writeFileSync(COUNTER_PATH, JSON.stringify(counter, null, 2));

let readme = fs.readFileSync(README_PATH, 'utf8');
const start = '<!-- UPDATED:START -->';
const end = '<!-- UPDATED:END -->';
const regex = new RegExp(`${start}[\\s\\S]*?${end}`);
readme = readme.replace(
  regex,
  `${start}\nLast update: **${counter.lastBump}** · Total bumps: **${counter.total}**\n${end}`
);
fs.writeFileSync(README_PATH, readme);

console.log(`Counter bumped → ${counter.total}`);
