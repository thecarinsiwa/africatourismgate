import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADMIN_LOCALES,
  ADMIN_MODULE_NAMES,
  ADMIN_SHELL_NAMESPACES,
} from './admin-messages-config.mjs';
import { adminMessagesDir } from './load-admin-messages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const messagesDir = adminMessagesDir(root);

for (const locale of ADMIN_LOCALES) {
  const monolithPath = join(messagesDir, `${locale}.json`);
  const data = JSON.parse(readFileSync(monolithPath, 'utf8'));
  const localeDir = join(messagesDir, locale);
  const modulesDir = join(localeDir, 'modules');

  mkdirSync(modulesDir, { recursive: true });

  for (const namespace of ADMIN_SHELL_NAMESPACES) {
    if (!(namespace in data)) {
      throw new Error(`Missing namespace "${namespace}" in ${locale}.json`);
    }
    writeFileSync(
      join(localeDir, `${namespace}.json`),
      `${JSON.stringify(data[namespace], null, 2)}\n`,
      'utf8',
    );
  }

  if (!('pages' in data)) {
    throw new Error(`Missing namespace "pages" in ${locale}.json`);
  }
  writeFileSync(join(localeDir, 'pages.json'), `${JSON.stringify(data.pages, null, 2)}\n`, 'utf8');

  if (!data.modules || typeof data.modules !== 'object') {
    throw new Error(`Missing namespace "modules" in ${locale}.json`);
  }

  for (const name of ADMIN_MODULE_NAMES) {
    if (!(name in data.modules)) {
      throw new Error(`Missing modules.${name} in ${locale}.json`);
    }
    writeFileSync(
      join(modulesDir, `${name}.json`),
      `${JSON.stringify(data.modules[name], null, 2)}\n`,
      'utf8',
    );
  }

  for (const extra of Object.keys(data.modules)) {
    if (!ADMIN_MODULE_NAMES.includes(extra)) {
      console.warn(`Warning: extra module "${extra}" in ${locale}.json — writing anyway`);
      writeFileSync(
        join(modulesDir, `${extra}.json`),
        `${JSON.stringify(data.modules[extra], null, 2)}\n`,
        'utf8',
      );
    }
  }

  rmSync(monolithPath);
  console.log(`Split ${locale}.json → ${locale}/ (${ADMIN_SHELL_NAMESPACES.length + 1 + ADMIN_MODULE_NAMES.length} files)`);
}

console.log('Modular admin messages ready.');
