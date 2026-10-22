import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mapTerraReviewToTripadvisor,
  toEntityId,
} from './tripadvisor-terra.mapper';

test('mapTerraReviewToTripadvisor maps a complete Terra review', () => {
  const mapped = mapTerraReviewToTripadvisor({
    id: 987654321,
    rating: 5,
    title: 'Great stay',
    text: 'Wonderful experience overall.',
    published_date: '2024-04-10T10:15:00Z',
    user: { username: 'TravellerMarie' },
  });
  assert.ok(mapped);
  assert.equal(mapped!.entityId, '987654321');
  assert.equal(mapped!.rating, 5);
  assert.equal(mapped!.title, 'Great stay');
  assert.equal(mapped!.body, 'Wonderful experience overall.');
  assert.equal(mapped!.authorName, 'TravellerMarie');
  assert.equal(mapped!.publishedAt?.toISOString(), '2024-04-10T10:15:00.000Z');
});

test('mapTerraReviewToTripadvisor skips missing body or id', () => {
  assert.equal(
    mapTerraReviewToTripadvisor({
      id: '1',
      rating: 4,
      text: '   ',
      user: { username: 'a' },
    }),
    null,
  );
  assert.equal(
    mapTerraReviewToTripadvisor({
      rating: 4,
      text: 'Hello',
      user: { username: 'a' },
    }),
    null,
  );
});

test('mapTerraReviewToTripadvisor rejects invalid ratings', () => {
  assert.equal(
    mapTerraReviewToTripadvisor({
      id: '1',
      rating: 0,
      text: 'Hello',
      user: { username: 'a' },
    }),
    null,
  );
  assert.equal(
    mapTerraReviewToTripadvisor({
      id: '1',
      rating: 9,
      text: 'Hello',
      user: { username: 'a' },
    }),
    null,
  );
});

test('mapTerraReviewToTripadvisor falls back author name', () => {
  const mapped = mapTerraReviewToTripadvisor({
    id: '2',
    rating: 4,
    text: 'Nice place',
  });
  assert.equal(mapped?.authorName, 'Voyageur Tripadvisor');
});

test('toEntityId truncates long ids via hash', () => {
  const longId = 'x'.repeat(50);
  const entityId = toEntityId(longId);
  assert.equal(entityId.length, 36);
  assert.notEqual(entityId, longId);
  assert.equal(toEntityId('123'), '123');
});
