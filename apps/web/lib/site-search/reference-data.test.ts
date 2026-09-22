import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimedCache } from './reference-data';

test('createTimedCache dedupes in-flight requests', async () => {
  let calls = 0;
  const cache = createTimedCache(async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return ['a'];
  });

  const [first, second] = await Promise.all([cache.get(), cache.get()]);
  assert.deepEqual(first, ['a']);
  assert.deepEqual(second, ['a']);
  assert.equal(calls, 1);
});

test('createTimedCache serves memoized data within TTL', async () => {
  let now = 1_000;
  let calls = 0;
  const cache = createTimedCache(
    async () => {
      calls += 1;
      return { n: calls };
    },
    { ttlMs: 100, now: () => now },
  );

  assert.deepEqual(await cache.get(), { n: 1 });
  now = 1_050;
  assert.deepEqual(await cache.get(), { n: 1 });
  assert.equal(calls, 1);

  now = 1_101;
  assert.deepEqual(await cache.get(), { n: 2 });
  assert.equal(calls, 2);
});

test('createTimedCache reset clears memoized data', async () => {
  let calls = 0;
  const cache = createTimedCache(async () => {
    calls += 1;
    return calls;
  });

  assert.equal(await cache.get(), 1);
  cache.reset();
  assert.equal(await cache.get(), 2);
  assert.equal(calls, 2);
});

test('createTimedCache does not cache rejected loads', async () => {
  let calls = 0;
  const cache = createTimedCache(async () => {
    calls += 1;
    if (calls === 1) {
      throw new Error('boom');
    }
    return 'ok';
  });

  await assert.rejects(() => cache.get(), /boom/);
  assert.equal(await cache.get(), 'ok');
  assert.equal(calls, 2);
});
