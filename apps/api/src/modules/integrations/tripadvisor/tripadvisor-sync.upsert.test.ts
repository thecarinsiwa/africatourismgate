import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { MappedTripadvisorReview } from './tripadvisor-terra.mapper';
import {
  upsertSyncedTripadvisorReview,
  type TripadvisorReviewStoreRow,
  type TripadvisorReviewUpsertStore,
} from './tripadvisor-sync.upsert';

function mapped(
  overrides: Partial<MappedTripadvisorReview> = {},
): MappedTripadvisorReview {
  return {
    entityId: '111',
    rating: 5,
    title: 'Great',
    body: 'Body text',
    authorName: 'Alice',
    publishedAt: new Date('2024-01-15T12:00:00Z'),
    ...overrides,
  };
}

function memoryStore(
  initial: TripadvisorReviewStoreRow[] = [],
): {
  store: Map<string, TripadvisorReviewStoreRow>;
  adapter: TripadvisorReviewUpsertStore;
} {
  const store = new Map(
    initial.map((row) => [`tripadvisor:${row.entityId}`, { ...row }]),
  );

  const adapter: TripadvisorReviewUpsertStore = {
    findByEntityId: async (entityId) =>
      store.get(`tripadvisor:${entityId}`) ?? null,
    recover: async (row) => {
      row.deletedAt = null;
      row.deletedByUserId = null;
    },
    save: async (row) => {
      store.set(`tripadvisor:${row.entityId}`, { ...row });
    },
    createNew: async ({ id, mapped: m, actorUserId }) => {
      const row: TripadvisorReviewStoreRow = {
        id,
        source: 'tripadvisor',
        entityType: 'tripadvisor',
        entityId: m.entityId,
        rating: m.rating,
        title: m.title,
        body: m.body,
        externalAuthorName: m.authorName,
        status: 'approved',
        userId: null,
        deletedAt: null,
        deletedByUserId: null,
        updatedByUserId: null,
        createdByUserId: actorUserId,
        createdAt: m.publishedAt ?? new Date(),
      };
      store.set(`tripadvisor:${m.entityId}`, row);
    },
  };

  return { store, adapter };
}

test('upsert imports a new review', async () => {
  const { store, adapter } = memoryStore();
  const outcome = await upsertSyncedTripadvisorReview(
    adapter,
    mapped(),
    'actor-1',
    () => 'new-id-1',
  );
  assert.equal(outcome, 'imported');
  const row = store.get('tripadvisor:111');
  assert.ok(row);
  assert.equal(row!.id, 'new-id-1');
  assert.equal(row!.body, 'Body text');
  assert.equal(row!.externalAuthorName, 'Alice');
  assert.equal(row!.status, 'approved');
  assert.equal(row!.createdByUserId, 'actor-1');
  assert.equal(row!.createdAt.toISOString(), '2024-01-15T12:00:00.000Z');
});

test('upsert updates an existing tripadvisor review', async () => {
  const { store, adapter } = memoryStore([
    {
      id: 'existing',
      source: 'tripadvisor',
      entityType: 'tripadvisor',
      entityId: '111',
      rating: 2,
      title: 'Old',
      body: 'Old body',
      externalAuthorName: 'Bob',
      status: 'hidden',
      userId: null,
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: null,
      createdByUserId: 'old-actor',
      createdAt: new Date('2020-01-01T00:00:00Z'),
    },
  ]);

  const outcome = await upsertSyncedTripadvisorReview(
    adapter,
    mapped({
      rating: 4,
      title: 'New title',
      body: 'New body',
      authorName: 'Bob2',
      publishedAt: new Date('2025-02-01T00:00:00Z'),
    }),
    'actor-2',
    () => 'should-not-use',
  );

  assert.equal(outcome, 'updated');
  const row = store.get('tripadvisor:111');
  assert.equal(row!.id, 'existing');
  assert.equal(row!.rating, 4);
  assert.equal(row!.title, 'New title');
  assert.equal(row!.body, 'New body');
  assert.equal(row!.externalAuthorName, 'Bob2');
  assert.equal(row!.status, 'approved');
  assert.equal(row!.updatedByUserId, 'actor-2');
  assert.equal(row!.createdAt.toISOString(), '2025-02-01T00:00:00.000Z');
});

test('upsert recovers soft-deleted review', async () => {
  const { store, adapter } = memoryStore([
    {
      id: 'soft',
      source: 'tripadvisor',
      entityType: 'tripadvisor',
      entityId: '111',
      rating: 1,
      title: null,
      body: 'Deleted',
      externalAuthorName: 'Eve',
      status: 'approved',
      userId: null,
      deletedAt: new Date('2023-01-01T00:00:00Z'),
      deletedByUserId: 'deleter',
      updatedByUserId: null,
      createdByUserId: 'creator',
      createdAt: new Date('2022-01-01T00:00:00Z'),
    },
  ]);

  const outcome = await upsertSyncedTripadvisorReview(
    adapter,
    mapped({ body: 'Restored', publishedAt: null }),
    'actor-3',
    () => 'unused',
  );

  assert.equal(outcome, 'updated');
  const row = store.get('tripadvisor:111');
  assert.equal(row!.deletedAt, null);
  assert.equal(row!.deletedByUserId, null);
  assert.equal(row!.body, 'Restored');
});

test('upsert skips when entity id is occupied by non-tripadvisor source', async () => {
  const { store, adapter } = memoryStore([
    {
      id: 'collision',
      source: 'platform',
      entityType: 'tripadvisor',
      entityId: '111',
      rating: 5,
      title: null,
      body: 'Platform',
      externalAuthorName: null,
      status: 'approved',
      userId: 'u1',
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: null,
      createdByUserId: null,
      createdAt: new Date(),
    },
  ]);

  const outcome = await upsertSyncedTripadvisorReview(
    adapter,
    mapped(),
    'actor-4',
    () => 'unused',
  );

  assert.equal(outcome, 'skipped');
  assert.equal(store.get('tripadvisor:111')!.source, 'platform');
  assert.equal(store.get('tripadvisor:111')!.body, 'Platform');
});
