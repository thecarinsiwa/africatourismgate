import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'apps', 'admin', 'app', '(dashboard)');

const SKIP_FILES = new Set([
  join(appDir, '[...segments]', 'page.tsx'),
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (entry === 'page.tsx') {
      files.push(full);
    }
  }
  return files;
}

function toRoutePath(filePath) {
  const rel = relative(appDir, filePath).replace(/\\/g, '/');
  const segments = rel.replace('/page.tsx', '').split('/');
  return segments
    .map((seg) => seg.replace(/^\[|\]$/g, ''))
    .filter(Boolean)
    .join('/');
}

function depthFromApp(filePath) {
  const rel = relative(join(root, 'apps', 'admin'), filePath).replace(/\\/g, '/');
  return rel.split('/').length - 2;
}

function importPathToI18n(depth) {
  return `${'../'.repeat(depth)}lib/i18n/admin-page-i18n`;
}

const report = { migrated: [], skipped: [], needsManual: [] };

for (const filePath of walk(appDir)) {
  if (SKIP_FILES.has(filePath)) {
    report.skipped.push({ file: filePath, reason: 'catch-all' });
    continue;
  }

  let content = readFileSync(filePath, 'utf8');

  if (content.includes('getAdminPageMetadata')) {
    report.skipped.push({ file: filePath, reason: 'already migrated' });
    continue;
  }

  if (!content.includes('export const metadata')) {
    if (content.includes("'use client'")) {
      report.needsManual.push({ file: filePath, reason: 'client-only page' });
    } else {
      report.skipped.push({ file: filePath, reason: 'no static metadata' });
    }
    continue;
  }

  if (content.includes('<PageHeader') || content.includes('<AdminPageIntro')) {
    report.needsManual.push({ file: filePath, reason: 'has PageHeader/AdminPageIntro inline' });
    continue;
  }

  const routePath = toRoutePath(filePath);
  const depth = depthFromApp(filePath);
  const importPath = importPathToI18n(depth);

  content = content.replace(
    /import type \{ Metadata \} from 'next';\n/,
    "import type { Metadata } from 'next';\n",
  );

  if (!content.includes("import type { Metadata }")) {
    content = `import type { Metadata } from 'next';\n${content}`;
  }

  content = content.replace(
    /export const metadata: Metadata = \{[\s\S]*?\};\n\n/,
    `import { getAdminPageMetadata } from '${importPath}';\n\nexport async function generateMetadata(): Promise<Metadata> {\n  return getAdminPageMetadata('${routePath}');\n}\n\n`,
  );

  if (content.includes('Chargement')) {
    content = content.replace(
      /<p className="text-sm text-atg-muted">Chargement…<\/p>/g,
      '<AdminPageLoading />',
    );
    if (!content.includes('AdminPageLoading')) {
      const loadingImport = `import { AdminPageLoading } from '${importPath.replace('lib/i18n/admin-page-i18n', 'components/pages/admin-page-loading')}';\n`;
      content = content.replace(
        /import type \{ Metadata \} from 'next';\n/,
        `import type { Metadata } from 'next';\n${loadingImport}`,
      );
    }
  }

  writeFileSync(filePath, content, 'utf8');
  report.migrated.push({ file: filePath, routePath });
}

const parityScript = `import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['fr', 'en', 'es'];
const data = Object.fromEntries(
  locales.map((locale) => [
    locale,
    JSON.parse(readFileSync(join(root, 'apps', 'admin', 'messages', \`\${locale}.json\`), 'utf8')),
  ]),
);

const frKeys = new Set(flattenKeys(data.fr.pages ?? {}));
let ok = true;

for (const locale of ['en', 'es']) {
  const keys = new Set(flattenKeys(data[locale].pages ?? {}));
  for (const key of frKeys) {
    if (!keys.has(key)) {
      console.error(\`Missing pages.\${key} in \${locale}.json\`);
      ok = false;
    }
  }
  for (const key of keys) {
    if (!frKeys.has(key)) {
      console.error(\`Extra pages.\${key} in \${locale}.json\`);
      ok = false;
    }
  }
}

if (ok) {
  console.log(\`pages.* parity OK (\${frKeys.size} keys × 3 locales)\`);
} else {
  process.exit(1);
}
`;

writeFileSync(join(root, 'scripts', 'check-i18n-parity.mjs'), parityScript, 'utf8');

console.log(JSON.stringify(report, null, 2));
