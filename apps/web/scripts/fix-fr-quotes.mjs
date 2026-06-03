import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../lib/i18n/translations.ts');
let src = fs.readFileSync(filePath, 'utf8');
const start = src.indexOf('const fr: Translations');
const end = src.indexOf('const en: Translations');
const frLines = src.slice(start, end).split('\n');

const fixed = frLines.map((line) => {
  const m = line.match(/^(\s+[\w.]+: )'(.*)',\s*$/);
  if (!m) return line;
  const [, prefix, content] = m;
  if (!content.includes("'") || content.includes("\\'")) return line;
  const escaped = content.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `${prefix}"${escaped}",`;
});

const fr = fixed.join('\n');
src = src.slice(0, start) + fr + src.slice(end);
fs.writeFileSync(filePath, src);
console.log('fixed apostrophe lines in fr block');
