import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WEB_LOCALES } from './web-messages-config.mjs';

export function webMessagesDir(root) {
  return join(root, 'apps', 'web', 'messages');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Load one locale's messages JSON (`fr.json`, `en.json`, `es.json`). */
export function loadWebMessages(root, locale) {
  return readJson(join(webMessagesDir(root), `${locale}.json`));
}

/** Load all web locales; throws if a file is missing. */
export function loadAllWebMessages(root) {
  return Object.fromEntries(
    WEB_LOCALES.map((locale) => [locale, loadWebMessages(root, locale)]),
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

/** Top-level namespaces present in the reference locale messages file. */
export function listWebNamespaces(messages) {
  return Object.keys(messages).sort();
}

/** Verify each WEB_LOCALES file exists under messages/. */
export function assertWebMessageFilesExist(root) {
  const dir = webMessagesDir(root);
  const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.json')));
  for (const locale of WEB_LOCALES) {
    const name = `${locale}.json`;
    if (!files.has(name)) {
      throw new Error(`Missing web messages file: ${join(dir, name)}`);
    }
  }
}

export { WEB_LOCALES };
