import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'apps/web/components');

const replacements = [
  ['text-[#0f1a16] dark:text-white', 'text-atg-fg'],
  ['text-[#0f1a16]', 'text-atg-fg'],
  ['dark:bg-[#0a1210]', 'dark:bg-atg-surface'],
  ['dark:bg-[#0f1915]', 'dark:bg-atg-surface'],
  ['bg-gray-50', 'bg-atg-surface'],
  ['hover:bg-gray-100', 'hover:bg-atg-surface'],
  ['hover:bg-gray-50', 'hover:bg-atg-surface'],
  ['border-gray-300', 'border-atg-border'],
  ['border-gray-200', 'border-atg-border'],
  ['border-gray-100', 'border-atg-border'],
  ['text-gray-900', 'text-atg-fg'],
  ['text-gray-800', 'text-atg-fg'],
  ['text-gray-700', 'text-atg-fg'],
  ['text-gray-600', 'text-atg-muted'],
  ['text-gray-500', 'text-atg-muted'],
  ['text-gray-400', 'text-atg-muted'],
  ['placeholder:text-gray-400', 'placeholder:text-atg-muted'],
  // bg-white on cards/panels — after borders so we don't break white/opacity variants
  ['border-atg-border bg-white', 'border-atg-border bg-atg-elevated'],
  ['bg-white shadow', 'bg-atg-elevated shadow'],
  ['bg-white px', 'bg-atg-elevated px'],
  ['bg-white py', 'bg-atg-elevated py'],
  ['bg-white transition', 'bg-atg-elevated transition'],
  ['bg-white dark:', 'bg-atg-elevated dark:'],
  ['bg-white/95', 'bg-atg-elevated/95'],
  ['bg-white/10', 'bg-white/10'],
  ['bg-white/15', 'bg-white/15'],
  ['bg-white/20', 'bg-white/20'],
  ['bg-white/40', 'bg-white/40'],
  ['bg-white/60', 'bg-white/60'],
  ['bg-white/80', 'bg-white/80'],
  ['bg-white/90', 'bg-white/90'],
  ['text-gray-300', 'text-atg-border'],
  ['text-amber-400', 'text-atg-warning'],
  // cleanup redundant dark pairs after token swap
  ['text-atg-fg dark:text-white', 'text-atg-fg'],
  ['text-atg-muted dark:text-atg-muted', 'text-atg-muted'],
  ['dark:text-atg-muted', 'text-atg-muted'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.tsx')) files.push(full);
  }
  return files;
}

let changedFiles = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles += 1;
    console.log(path.relative(process.cwd(), file));
  }
}

console.log(`Updated ${changedFiles} files.`);
