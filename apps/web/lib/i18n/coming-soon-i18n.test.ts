import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from './translations';
import type { Locale } from './types';

const LOCALES = ['fr', 'en', 'es'] as const satisfies readonly Locale[];

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

test('comingSoon i18n keys are present in fr/en/es', () => {
  for (const locale of LOCALES) {
    const comingSoon = translations[locale].comingSoon;
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
