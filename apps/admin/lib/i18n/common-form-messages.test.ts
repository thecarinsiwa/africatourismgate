import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAdminMessages } from './load-messages';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCALES = ['fr', 'en', 'es'] as const;

function loadCommonForm(locale: (typeof LOCALES)[number]): Record<string, unknown> {
  const raw = readFileSync(
    join(root, 'messages', locale, 'modules', 'common.json'),
    'utf8',
  );
  const json = JSON.parse(raw) as { form?: Record<string, unknown> };
  assert.ok(json.form, `${locale}: modules.common.form missing`);
  return json.form;
}

test('modules.common.form.loading is translated in every locale', () => {
  for (const locale of LOCALES) {
    const loading = loadCommonForm(locale).loading;
    assert.equal(typeof loading, 'string', `${locale}: form.loading`);
    assert.ok((loading as string).trim().length > 0, `${locale}: form.loading empty`);
  }
});

test('loadAdminMessages exposes modules.common.form.loading', async () => {
  const expected = { fr: 'Chargement…', en: 'Loading…', es: 'Cargando…' };
  for (const locale of LOCALES) {
    const messages = await loadAdminMessages(locale);
    assert.equal(messages.modules.common.form.loading, expected[locale], locale);
  }
});

test('modules.common.form has the same keys in fr, en and es', () => {
  const [reference, ...others] = LOCALES;
  const referenceKeys = Object.keys(loadCommonForm(reference)).sort();

  for (const locale of others) {
    assert.deepEqual(
      Object.keys(loadCommonForm(locale)).sort(),
      referenceKeys,
      `${locale}: form keys differ from ${reference}`,
    );
  }
});
