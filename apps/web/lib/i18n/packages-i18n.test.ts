import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = join(process.cwd(), 'messages');

function loadPackages(locale: 'fr' | 'en' | 'es') {
  const messages = JSON.parse(
    readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
  ) as { packages: Record<string, unknown> };
  return messages.packages;
}

function packageKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return packageKeys(nested as Record<string, unknown>, path);
    }
    return [path];
  });
}

test('packages i18n keys match between FR and ES messages', () => {
  const frKeys = packageKeys(loadPackages('fr')).sort();
  const esKeys = packageKeys(loadPackages('es')).sort();
  assert.deepEqual(esKeys, frKeys);
});

test('packages i18n keys match between FR and EN messages', () => {
  const frKeys = packageKeys(loadPackages('fr')).sort();
  const enKeys = packageKeys(loadPackages('en')).sort();
  assert.deepEqual(enKeys, frKeys);
});
