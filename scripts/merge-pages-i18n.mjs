import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADMIN_LOCALES } from './admin-messages-config.mjs';
import { adminMessagesDir } from './load-admin-messages.mjs';
import { pagesI18n } from './pages-i18n-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = adminMessagesDir(root);

for (const locale of ADMIN_LOCALES) {
  const localeDir = join(messagesDir, locale);
  mkdirSync(localeDir, { recursive: true });
  const filePath = join(localeDir, 'pages.json');
  writeFileSync(filePath, `${JSON.stringify(pagesI18n[locale], null, 2)}\n`, 'utf8');
  console.log(`Wrote ${locale}/pages.json`);
}
