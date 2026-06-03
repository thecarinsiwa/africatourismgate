import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../lib/i18n/translations.ts');

/** UTF-8 misread as Latin-1 / Windows-1252 (common in this file). */
const REPLACEMENTS = [
  ['Ã€', 'À'],
  ['Ã©', 'é'],
  ['Ã¨', 'è'],
  ['Ã´', 'ô'],
  ['Ã®', 'î'],
  ['Ã»', 'û'],
  ['Ã§', 'ç'],
  ['Ã‰', 'É'],
  ['Ã¢', 'â'],
  ['Ã«', 'ë'],
  ['Ã¯', 'ï'],
  ['Ã¼', 'ü'],
  ['â€™', "'"],
  ['â€"', '—'],
  ['â€¦', '…'],
  ['â€¢', '•'],
  ['â†’', '→'],
  ['cÅ“ur', 'cœur'],
  ['Å“', 'œ'],
];

let src = fs.readFileSync(filePath, 'utf8');
const start = src.indexOf('const fr: Translations');
const end = src.indexOf('const en: Translations');
if (start < 0 || end < 0) {
  console.error('fr/en blocks not found');
  process.exit(1);
}

let fr = src.slice(start, end);
REPLACEMENTS.sort((a, b) => b[0].length - a[0].length);
for (const [from, to] of REPLACEMENTS) {
  fr = fr.split(from).join(to);
}

// UTF-8 à stored as C3 A0 misread: Ã + NBSP
fr = fr.replace(/\u00c3\u00a0/g, '\u00e0');

const before = (src.slice(start, end).match(/Ã|â€/g) || []).length;
const after = (fr.match(/Ã|â€/g) || []).length;

src = src.slice(0, start) + fr + src.slice(end);
fs.writeFileSync(filePath, src);
console.log('mojibake before:', before, 'after:', after);
console.log('Hôtels:', fr.includes('Hôtels'));
console.log('À propos:', fr.includes('À propos'));
