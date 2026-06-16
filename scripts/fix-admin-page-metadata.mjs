import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'apps', 'admin', 'app', '(dashboard)');

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry === 'page.tsx') files.push(full);
  }
  return files;
}

function toRoutePath(filePath) {
  return relative(appDir, filePath)
    .replace(/\\/g, '/')
    .replace('/page.tsx', '')
    .split('/')
    .map((s) => s.replace(/^\[|\]$/g, ''))
    .join('/');
}

function relImport(filePath, target) {
  const rel = relative(dirname(filePath), target).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

for (const filePath of walk(appDir)) {
  let content = readFileSync(filePath, 'utf8');
  if (!content.includes('export const metadata')) continue;

  const routePath = toRoutePath(filePath);
  const i18nImport = relImport(filePath, join(root, 'apps', 'admin', 'lib', 'i18n', 'admin-page-i18n'));
  const loadingImport = relImport(filePath, join(root, 'apps', 'admin', 'components', 'pages', 'admin-page-loading'));

  const normalized = content.replace(/\r\n/g, '\n');
  const metadataRe = /export const metadata: Metadata = \{[\s\S]*?\};\n+/;

  if (!metadataRe.test(normalized)) {
    console.warn('No metadata match:', routePath);
    continue;
  }

  let next = normalized.replace(
    metadataRe,
    `export async function generateMetadata(): Promise<Metadata> {\n  return getAdminPageMetadata('${routePath}');\n}\n\n`,
  );

  if (!next.includes(`from '${i18nImport}'`)) {
    next = next.replace(
      /import type \{ Metadata \} from 'next';\n/,
      `import type { Metadata } from 'next';\nimport { getAdminPageMetadata } from '${i18nImport}';\n`,
    );
  }

  if (next.includes('<AdminPageLoading') && !next.includes('admin-page-loading')) {
    next = next.replace(
      /import type \{ Metadata \} from 'next';\n/,
      `import type { Metadata } from 'next';\nimport { AdminPageLoading } from '${loadingImport}';\n`,
    );
  }

  writeFileSync(filePath, next, 'utf8');
  console.log('Fixed metadata:', routePath);
}
