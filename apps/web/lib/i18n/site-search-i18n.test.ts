import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_SEARCH_GROUP_ORDER } from '../site-search/sources';

const MESSAGES_DIR = join(process.cwd(), 'messages');

function loadSiteSearch(locale: 'fr' | 'en' | 'es') {
  const messages = JSON.parse(
    readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
  ) as { siteSearch: Record<string, unknown> };
  return messages.siteSearch;
}

function nestedKeys(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return nestedKeys(nested as Record<string, unknown>, path);
    }
    return [path];
  });
}

test('siteSearch i18n keys match between FR and ES messages', () => {
  const frKeys = nestedKeys(loadSiteSearch('fr')).sort();
  const esKeys = nestedKeys(loadSiteSearch('es')).sort();
  assert.deepEqual(esKeys, frKeys);
});

test('siteSearch i18n keys match between FR and EN messages', () => {
  const frKeys = nestedKeys(loadSiteSearch('fr')).sort();
  const enKeys = nestedKeys(loadSiteSearch('en')).sort();
  assert.deepEqual(enKeys, frKeys);
});

test('siteSearch groups cover every UI group id', () => {
  const fr = loadSiteSearch('fr');
  const groups = fr.groups as Record<string, string>;
  for (const group of SITE_SEARCH_GROUP_ORDER) {
    assert.ok(groups[group], `missing groups.${group}`);
  }
  assert.ok(typeof fr.resultCount === 'string');
  assert.ok(typeof fr.kindEntity === 'string');
  assert.ok(typeof fr.kindPrefilled === 'string');
});
