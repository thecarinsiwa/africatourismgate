import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  ADMIN_LOCALES,
  ADMIN_MODULE_NAMES,
  ADMIN_SHELL_NAMESPACES,
} from './admin-messages-config.mjs';

export function adminMessagesDir(root) {
  return join(root, 'apps', 'admin', 'messages');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Load merged messages for one locale from the modular layout. */
export function loadAdminMessages(root, locale) {
  const base = join(adminMessagesDir(root), locale);
  const messages = {};

  for (const namespace of ADMIN_SHELL_NAMESPACES) {
    messages[namespace] = readJson(join(base, `${namespace}.json`));
  }

  messages.pages = readJson(join(base, 'pages.json'));

  const modulesDir = join(base, 'modules');
  const moduleFiles = readdirSync(modulesDir).filter((f) => f.endsWith('.json'));
  messages.modules = {};

  for (const file of moduleFiles) {
    const name = file.replace(/\.json$/, '');
    messages.modules[name] = readJson(join(modulesDir, file));
  }

  return messages;
}

/** Load all locales; throws if a locale directory is incomplete. */
export function loadAllAdminMessages(root) {
  return Object.fromEntries(
    ADMIN_LOCALES.map((locale) => [locale, loadAdminMessages(root, locale)]),
  );
}

export function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

export { ADMIN_LOCALES, ADMIN_MODULE_NAMES, ADMIN_SHELL_NAMESPACES };
