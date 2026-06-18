import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADMIN_LOCALES } from './admin-messages-config.mjs';
import { adminMessagesDir } from './load-admin-messages.mjs';
import { modulesI18n } from './modules-i18n-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = adminMessagesDir(root);

for (const locale of ADMIN_LOCALES) {
  const modulesDir = join(messagesDir, locale, 'modules');
  mkdirSync(modulesDir, { recursive: true });

  for (const [name, content] of Object.entries(modulesI18n[locale])) {
    const filePath = join(modulesDir, `${name}.json`);
    writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  }

  console.log(`Wrote ${locale}/modules/*.json (${Object.keys(modulesI18n[locale]).length} files)`);
}
