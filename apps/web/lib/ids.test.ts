import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isUuidV4 } from './ids';

describe('isUuidV4', () => {
  test('accepts UUID v4', () => {
    assert.equal(isUuidV4('00000000-0000-4000-8000-000000003036'), true);
    assert.equal(isUuidV4('550e8400-e29b-41d4-a716-446655440000'), true);
  });

  test('rejects invalid values', () => {
    assert.equal(isUuidV4(null), false);
    assert.equal(isUuidV4(undefined), false);
    assert.equal(isUuidV4(''), false);
    assert.equal(isUuidV4('00000000-0000-4000-80000-000000003036'), false);
    assert.equal(isUuidV4('not-a-uuid'), false);
    assert.equal(isUuidV4('00000000-0000-3000-8000-000000003036'), false);
  });
});
