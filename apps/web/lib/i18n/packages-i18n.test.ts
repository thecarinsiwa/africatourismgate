import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from './translations';

function packageKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return packageKeys(nested as Record<string, unknown>, path);
    }
    return [path];
  });
}

test('packages i18n keys match between FR and ES', () => {
  const frKeys = packageKeys(translations.fr.packages).sort();
  const esKeys = packageKeys(translations.es.packages).sort();
  assert.deepEqual(esKeys, frKeys);
});

test('packages i18n keys match between FR and EN', () => {
  const frKeys = packageKeys(translations.fr.packages).sort();
  const enKeys = packageKeys(translations.en.packages).sort();
  assert.deepEqual(enKeys, frKeys);
});
