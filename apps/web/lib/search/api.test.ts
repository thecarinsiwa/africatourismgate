import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchVerticalResults } from './api';

test('fetchVerticalResults returns failed without throwing when API is unreachable', async () => {
  const prev = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:9/api';

  try {
    for (const vertical of ['hotels', 'flights', 'cars', 'cruises', 'tours'] as const) {
      const result = await fetchVerticalResults(vertical, 'Kinshasa');
      assert.equal(result.failed, true);
      assert.deepEqual(result.items, []);
    }
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = prev;
  }
});
