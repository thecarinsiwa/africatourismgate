import test from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException } from '@nestjs/common';
import { resolvePublicFooter } from '@africatourismgate/types';
import { validateSettingValue } from './validate-setting-value';

function rejectsWith(value: Record<string, unknown>, fragment: string): void {
  assert.throws(
    () => validateSettingValue('footer', value),
    (error: unknown) =>
      error instanceof BadRequestException && String(error.message).includes(fragment),
  );
}

test('validateSettingValue footer accepts empty messages', () => {
  const result = validateSettingValue('footer', { messages: {} });
  assert.deepEqual(result, { messages: {} });
});

test('validateSettingValue footer trims and keeps fr/en/es messages', () => {
  const result = validateSettingValue('footer', {
    messages: {
      fr: {
        tagline: '  Tagline FR  ',
        newsletterDesc: ' News FR ',
        designedByNames: ' A et B ',
      },
      en: {
        tagline: 'Tagline EN',
        newsletterDesc: 'News EN',
        designedByNames: 'A and B',
      },
      es: {
        tagline: '   ',
        newsletterDesc: 'News ES',
        designedByNames: '',
      },
    },
  });
  assert.deepEqual(result, {
    messages: {
      fr: {
        tagline: 'Tagline FR',
        newsletterDesc: 'News FR',
        designedByNames: 'A et B',
      },
      en: {
        tagline: 'Tagline EN',
        newsletterDesc: 'News EN',
        designedByNames: 'A and B',
      },
      es: {
        tagline: '',
        newsletterDesc: 'News ES',
        designedByNames: '',
      },
    },
  });
});

test('validateSettingValue footer requires fr when any locale is set', () => {
  rejectsWith(
    {
      messages: {
        en: { tagline: 'Hello', newsletterDesc: '', designedByNames: '' },
      },
    },
    'messages.fr',
  );
});

test('validateSettingValue footer rejects unknown locale', () => {
  rejectsWith(
    {
      messages: {
        fr: { tagline: 'Ok', newsletterDesc: '', designedByNames: '' },
        de: { tagline: 'Nein', newsletterDesc: '', designedByNames: '' },
      },
    },
    'messages.de',
  );
});

test('validateSettingValue footer enforces length limits', () => {
  rejectsWith(
    {
      messages: {
        fr: {
          tagline: 'x'.repeat(401),
          newsletterDesc: '',
          designedByNames: '',
        },
      },
    },
    'tagline',
  );
});

test('resolvePublicFooter falls back to fr then defaults', () => {
  const resolved = resolvePublicFooter(
    {
      messages: {
        fr: {
          tagline: 'FR only',
          newsletterDesc: '',
          designedByNames: 'Équipe',
        },
      },
    },
    'en',
  );
  assert.equal(resolved.tagline, 'FR only');
  assert.equal(resolved.designedByNames, 'Équipe');
  assert.ok(resolved.newsletterDesc.length > 0);
});
