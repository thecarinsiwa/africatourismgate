import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { validateSettingValue } from './validate-setting-value';

function assertBadRequest(fn: () => unknown) {
  assert.throws(fn, (err: unknown) => err instanceof BadRequestException);
}

test('validateSettingValue homepage_reviews accepts both sources enabled', () => {
  const result = validateSettingValue('homepage_reviews', {
    showTripadvisorReviews: true,
    showPlatformReviews: true,
  });
  assert.deepEqual(result, {
    showTripadvisorReviews: true,
    showPlatformReviews: true,
  });
});

test('validateSettingValue homepage_reviews accepts both sources disabled', () => {
  const result = validateSettingValue('homepage_reviews', {
    showTripadvisorReviews: false,
    showPlatformReviews: false,
  });
  assert.deepEqual(result, {
    showTripadvisorReviews: false,
    showPlatformReviews: false,
  });
});

test('validateSettingValue homepage_reviews accepts mixed flags', () => {
  const result = validateSettingValue('homepage_reviews', {
    showTripadvisorReviews: true,
    showPlatformReviews: false,
  });
  assert.deepEqual(result, {
    showTripadvisorReviews: true,
    showPlatformReviews: false,
  });
});

test('validateSettingValue homepage_reviews rejects missing showTripadvisorReviews', () => {
  assertBadRequest(() =>
    validateSettingValue('homepage_reviews', {
      showPlatformReviews: true,
    }),
  );
});

test('validateSettingValue homepage_reviews rejects non-boolean flags', () => {
  assertBadRequest(() =>
    validateSettingValue('homepage_reviews', {
      showTripadvisorReviews: 'yes',
      showPlatformReviews: true,
    }),
  );
  assertBadRequest(() =>
    validateSettingValue('homepage_reviews', {
      showTripadvisorReviews: true,
      showPlatformReviews: 1,
    }),
  );
});
