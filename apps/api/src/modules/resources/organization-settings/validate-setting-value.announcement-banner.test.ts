import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { resolvePublicAnnouncementBanner } from '@africatourismgate/types';
import { validateSettingValue } from './validate-setting-value';

function rejectsWith(value: Record<string, unknown>, fragment: string): void {
  assert.throws(
    () => validateSettingValue('announcement_banner', value),
    (error: unknown) =>
      error instanceof BadRequestException && String(error.message).includes(fragment),
  );
}

const base = {
  enabled: true,
  color: 'red',
  intensity: 'high',
  messages: { fr: { text: 'Promo de rentrée' } },
};

test('validateSettingValue announcement_banner accepts a minimal enabled banner', () => {
  const result = validateSettingValue('announcement_banner', base);
  assert.deepEqual(result, {
    enabled: true,
    color: 'red',
    intensity: 'high',
    messages: { fr: { text: 'Promo de rentrée' } },
  });
});

test('validateSettingValue announcement_banner trims and keeps CTA', () => {
  const result = validateSettingValue('announcement_banner', {
    ...base,
    messages: {
      fr: { text: '  Nouveau  ', ctaLabel: ' En savoir plus ' },
      en: { text: 'New', ctaLabel: 'Learn more' },
      es: { text: '   ' },
    },
    ctaUrl: ' /blog ',
    ctaNewTab: true,
  });
  assert.deepEqual(result.messages, {
    fr: { text: 'Nouveau', ctaLabel: 'En savoir plus' },
    en: { text: 'New', ctaLabel: 'Learn more' },
  });
  assert.equal(result.ctaUrl, '/blog');
  assert.equal(result.ctaNewTab, true);
});

test('validateSettingValue announcement_banner allows disabled banner without text', () => {
  const result = validateSettingValue('announcement_banner', {
    enabled: false,
    color: 'blue',
    intensity: 'low',
    messages: {},
  });
  assert.equal(result.enabled, false);
  assert.deepEqual(result.messages, {});
});

test('validateSettingValue announcement_banner requires fr text when enabled', () => {
  rejectsWith({ ...base, messages: { en: { text: 'Hello' } } }, 'messages.fr.text');
});

test('validateSettingValue announcement_banner rejects unknown color / intensity', () => {
  rejectsWith({ ...base, color: 'purple' }, 'color');
  rejectsWith({ ...base, intensity: 'medium' }, 'intensity');
});

test('validateSettingValue announcement_banner rejects non-boolean enabled', () => {
  rejectsWith({ ...base, enabled: 'yes' }, 'enabled');
});

test('validateSettingValue announcement_banner rejects unsupported locale', () => {
  rejectsWith({ ...base, messages: { ...base.messages, de: { text: 'Hallo' } } }, 'de');
});

test('validateSettingValue announcement_banner enforces length limits', () => {
  rejectsWith(
    { ...base, messages: { fr: { text: 'x'.repeat(281) } } },
    'messages.fr.text',
  );
  rejectsWith(
    { ...base, messages: { fr: { text: 'ok', ctaLabel: 'x'.repeat(41) } } },
    'messages.fr.ctaLabel',
  );
});

test('validateSettingValue announcement_banner rejects CTA label without text', () => {
  rejectsWith(
    { ...base, messages: { ...base.messages, en: { ctaLabel: 'Learn more' } } },
    'messages.en.text',
  );
});

test('validateSettingValue announcement_banner validates ctaUrl', () => {
  rejectsWith({ ...base, ctaUrl: 'javascript:alert(1)' }, 'ctaUrl');
  rejectsWith({ ...base, ctaUrl: '//evil.example' }, 'ctaUrl');
  rejectsWith({ ...base, ctaUrl: 'ftp://files.example' }, 'ctaUrl');
  const ok = validateSettingValue('announcement_banner', {
    ...base,
    ctaUrl: 'https://example.org/promo',
  });
  assert.equal(ok.ctaUrl, 'https://example.org/promo');
  assert.equal(ok.ctaNewTab, false);
});

test('resolvePublicAnnouncementBanner falls back to fr and hides CTA without label', () => {
  const stored = validateSettingValue('announcement_banner', {
    ...base,
    messages: {
      fr: { text: 'Bonjour', ctaLabel: 'Voir' },
      en: { text: 'Hello' },
    },
    ctaUrl: '/packages',
  });

  const es = resolvePublicAnnouncementBanner(stored, 'es');
  assert.equal(es.enabled, true);
  assert.equal(es.text, 'Bonjour');
  assert.equal(es.ctaLabel, 'Voir');
  assert.equal(es.ctaUrl, '/packages');

  const en = resolvePublicAnnouncementBanner(stored, 'en');
  assert.equal(en.text, 'Hello');
  assert.equal(en.ctaLabel, null);
  assert.equal(en.ctaUrl, null);
  assert.notEqual(en.version, es.version);
});

test('resolvePublicAnnouncementBanner returns disabled default when off or missing', () => {
  assert.equal(resolvePublicAnnouncementBanner(null, 'fr').enabled, false);
  assert.equal(
    resolvePublicAnnouncementBanner({ ...base, enabled: false }, 'fr').enabled,
    false,
  );
});
