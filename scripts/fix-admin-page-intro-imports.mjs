import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../apps/admin/app/(dashboard)');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name === 'page.tsx') files.push(full);
  }
  return files;
}

function resolveImportPath(rel) {
  const depth = 1 + rel.split('/').length;
  return `${'../'.repeat(depth)}components/admin-page-intro`;
}

let fixed = 0;

for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('AdminPageIntro')) continue;

  const rel = path.relative(root, file).replace(/\\/g, '/');
  const importPath = resolveImportPath(rel);
  const importLine = `import { AdminPageIntro } from '${importPath}';\n`;

  const existingImport = content.match(
    /^import \{ AdminPageIntro \} from '[^']+';\r?\n/m,
  );

  if (existingImport) {
    if (existingImport[0].includes(importPath)) continue;
    content = content.replace(
      /^import \{ AdminPageIntro \} from '[^']+';\r?\n/m,
      importLine,
    );
  } else if (content.match(/^import type \{ Metadata \} from 'next';\r?\n/)) {
    content = content.replace(
      /^import type \{ Metadata \} from 'next';\r?\n/,
      `import type { Metadata } from 'next';\n${importLine}`,
    );
  } else {
    content = importLine + content;
  }

  fs.writeFileSync(file, content);
  fixed += 1;
  console.log('fixed', rel, '->', importPath);
}

console.log(`Fixed ${fixed} files.`);
