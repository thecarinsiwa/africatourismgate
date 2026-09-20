import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { translations } from './translations';
import type { Locale } from './types';

const LOCALES = ['fr', 'en', 'es'] as const satisfies readonly Locale[];
const MESSAGES_DIR = join(process.cwd(), 'messages');

const REQUIRED_COMING_SOON_KEYS = [
  'badge',
  'title',
  'siteBody',
  'body',
  'backToSearch',
  'backHome',
] as const;

const REQUIRED_RESERVATION_EMPTY_KEYS = [
  'empty',
  'emptyDescription',
  'emptyBrowse',
  'emptyFilter',
] as const;

function loadComingSoon(locale: Locale) {
  const messages = JSON.parse(
    readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'),
  ) as { comingSoon: Record<string, string> };
  return messages.comingSoon;
}

test('comingSoon i18n keys are present in fr/en/es messages', () => {
  for (const locale of LOCALES) {
    const comingSoon = loadComingSoon(locale);
    for (const key of REQUIRED_COMING_SOON_KEYS) {
      assert.ok(comingSoon[key]?.trim(), `${locale}.comingSoon.${key} must be non-empty`);
    }
  }
});

test('account reservations empty i18n keys are present in fr/en/es', () => {
  for (const locale of LOCALES) {
    const reservations = translations[locale].account.reservations;
    for (const key of REQUIRED_RESERVATION_EMPTY_KEYS) {
      assert.ok(reservations[key]?.trim(), `${locale}.account.reservations.${key} must be non-empty`);
    }
  }
});
