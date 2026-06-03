import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../lib/i18n/translations.ts');

const MOJIBAKE = /Ã.|â€|Â./;

function fixMojibake(text) {
  if (!MOJIBAKE.test(text)) return text;
  try {
    return Buffer.from(text, 'latin1').toString('utf8');
  } catch {
    return text;
  }
}

function fixQuotedStrings(block) {
  let out = block.replace(
    /'((?:\\.|[^'\\])*)'/g,
    (match, inner) => {
      const decoded = inner.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      if (!MOJIBAKE.test(decoded)) return match;
      const fixed = fixMojibake(decoded);
      if (fixed === decoded) return match;
      const escaped = fixed.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `'${escaped}'`;
    },
  );
  out = out.replace(
    /"((?:\\.|[^"\\])*)"/g,
    (match, inner) => {
      const decoded = inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (!MOJIBAKE.test(decoded)) return match;
      const fixed = fixMojibake(decoded);
      if (fixed === decoded) return match;
      const escaped = fixed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"${escaped}"`;
    },
  );
  return out;
}

let src = fs.readFileSync(filePath, 'utf8');
const start = src.indexOf('const en: Translations');
const end = src.indexOf('export const translations:');
if (start < 0 || end < 0) {
  console.error('Could not find en block');
  process.exit(1);
}

const enFixed = fixQuotedStrings(src.slice(start, end));
src = src.slice(0, start) + enFixed + src.slice(end);
fs.writeFileSync(filePath, src);
console.log('en mojibake left:', (enFixed.match(/Ã|â€/g) || []).length);
