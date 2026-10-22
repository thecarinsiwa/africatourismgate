import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import {
  maskTripadvisorApiKey,
  mergeTripadvisorSyncApiKey,
  toTripadvisorSyncAdminSettingValue,
  toTripadvisorSyncAdminValue,
} from '@africatourismgate/types';
import { validateSettingValue } from './validate-setting-value';

function assertBadRequest(fn: () => unknown) {
  assert.throws(fn, (err: unknown) => err instanceof BadRequestException);
}

test('validateSettingValue tripadvisor_sync accepts empty credentials', () => {
  const result = validateSettingValue('tripadvisor_sync', {
    locationId: '',
    apiKey: '',
    language: 'primary',
  });
  assert.deepEqual(result, {
    locationId: '',
    apiKey: '',
    language: 'primary',
  });
});

test('validateSettingValue tripadvisor_sync accepts locationId digits and language', () => {
  const result = validateSettingValue('tripadvisor_sync', {
    locationId: '123456',
    apiKey: 'terra-secret-key',
    language: 'fr',
  });
  assert.deepEqual(result, {
    locationId: '123456',
    apiKey: 'terra-secret-key',
    language: 'fr',
  });
});

test('validateSettingValue tripadvisor_sync defaults language to primary when blank', () => {
  const result = validateSettingValue('tripadvisor_sync', {
    locationId: '99',
    apiKey: '',
    language: '',
  });
  assert.equal(result.language, 'primary');
});

test('validateSettingValue tripadvisor_sync rejects non-digit locationId', () => {
  assertBadRequest(() =>
    validateSettingValue('tripadvisor_sync', {
      locationId: 'abc-123',
      apiKey: '',
      language: 'primary',
    }),
  );
});

test('validateSettingValue tripadvisor_sync rejects masked apiKey round-trip', () => {
  assertBadRequest(() =>
    validateSettingValue('tripadvisor_sync', {
      locationId: '1',
      apiKey: '••••key1',
      language: 'primary',
    }),
  );
});

test('validateSettingValue tripadvisor_sync rejects invalid language chars', () => {
  assertBadRequest(() =>
    validateSettingValue('tripadvisor_sync', {
      locationId: '1',
      apiKey: '',
      language: 'fr/en',
    }),
  );
});

test('mergeTripadvisorSyncApiKey keeps existing key when incoming empty', () => {
  const merged = mergeTripadvisorSyncApiKey(
    { locationId: '1', apiKey: 'stored-secret', language: 'en' },
    { locationId: '2', apiKey: '', language: 'fr' },
  );
  assert.deepEqual(merged, {
    locationId: '2',
    apiKey: 'stored-secret',
    language: 'fr',
  });
});

test('mergeTripadvisorSyncApiKey replaces key when incoming provided', () => {
  const merged = mergeTripadvisorSyncApiKey(
    { locationId: '1', apiKey: 'old', language: 'en' },
    { locationId: '1', apiKey: 'new-key', language: 'en' },
  );
  assert.equal(merged.apiKey, 'new-key');
});

test('toTripadvisorSyncAdminSettingValue never echoes clear apiKey', () => {
  const admin = toTripadvisorSyncAdminSettingValue({
    locationId: '42',
    apiKey: 'super-secret-key',
    language: 'primary',
  });
  assert.equal(admin.apiKey, '');
  assert.equal(admin.hasApiKey, true);
  assert.equal(admin.locationId, '42');
  assert.equal(admin.apiKeyMasked, '••••-key');
  assert.ok(!JSON.stringify(admin).includes('super-secret'));
});

test('maskTripadvisorApiKey and admin view when no key', () => {
  assert.equal(maskTripadvisorApiKey(''), '');
  assert.equal(maskTripadvisorApiKey('abcd'), '••••abcd');
  const empty = toTripadvisorSyncAdminValue({
    locationId: '',
    apiKey: '',
    language: 'primary',
  });
  assert.equal(empty.hasApiKey, false);
  assert.equal(empty.apiKeyMasked, '');
});
