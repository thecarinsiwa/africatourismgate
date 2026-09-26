import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
  'metaTitle',
  'metaDescription',
  'verticalMetaTitle',
  'verticalMetaDescription',
] as const;

const REQUIRED_MAINTENANCE_KEYS = [
  'badge',
  'title',
  'message',
  'localeFallback',
  'endsAtLabel',
  'countdownLabel',
  'countdownDays',
  'countdownHours',
  'countdownMinutes',
  'countdownSeconds',
  'countdownDone',
  'metaTitle',
  'metaDescription',
] as const;

const REQUIRED_RESERVATION_EMPTY_KEYS = [
  'empty',
  'emptyDescription',
  'emptyBrowse',
  'emptyFilter',
] as const;

const REQUIRED_NOT_FOUND_KEYS = [
  'code',
  'badge',
  'title',
  'description',
  'backHome',
  'help',
  'metaTitle',
  'metaDescription',
] as const;

function loadMessages(locale: Locale) {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as {
    comingSoon: Record<string, string>;
    maintenance: Record<string, string>;
    notFound: Record<string, string>;
    account: { reservations: Record<string, string> };
  };
}

test('comingSoon i18n keys are present in fr/en/es messages', () => {
  for (const locale of LOCALES) {
    const comingSoon = loadMessages(locale).comingSoon;
    for (const key of REQUIRED_COMING_SOON_KEYS) {
      assert.ok(comingSoon[key]?.trim(), `${locale}.comingSoon.${key} must be non-empty`);
    }
  }
});

test('maintenance i18n keys are present in fr/en/es messages', () => {
  for (const locale of LOCALES) {
    const maintenance = loadMessages(locale).maintenance;
    for (const key of REQUIRED_MAINTENANCE_KEYS) {
      assert.ok(maintenance[key]?.trim(), `${locale}.maintenance.${key} must be non-empty`);
    }
  }
});

test('account reservations empty i18n keys are present in fr/en/es messages', () => {
  for (const locale of LOCALES) {
    const reservations = loadMessages(locale).account.reservations;
    for (const key of REQUIRED_RESERVATION_EMPTY_KEYS) {
      assert.ok(
        reservations[key]?.trim(),
        `${locale}.account.reservations.${key} must be non-empty`,
      );
    }
  }
});

test('notFound i18n keys are present in fr/en/es messages', () => {
  for (const locale of LOCALES) {
    const notFound = loadMessages(locale).notFound;
    for (const key of REQUIRED_NOT_FOUND_KEYS) {
      assert.ok(notFound[key]?.trim(), `${locale}.notFound.${key} must be non-empty`);
    }
  }
});
