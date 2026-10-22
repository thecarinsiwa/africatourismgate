import type { MappedTripadvisorReview } from './tripadvisor-terra.mapper';

export type TripadvisorSyncUpsertOutcome = 'imported' | 'updated' | 'skipped';

export type TripadvisorReviewStoreRow = {
  id: string;
  source: 'platform' | 'tripadvisor' | string;
  entityType: string;
  entityId: string;
  rating: number;
  title: string | null;
  body: string | null;
  externalAuthorName: string | null;
  status: 'pending' | 'approved' | 'hidden' | string;
  userId: string | null;
  deletedAt: Date | null;
  deletedByUserId: string | null;
  updatedByUserId: string | null;
  createdByUserId: string | null;
  createdAt: Date;
};

export type TripadvisorReviewUpsertStore = {
  findByEntityId(entityId: string): Promise<TripadvisorReviewStoreRow | null>;
  recover(row: TripadvisorReviewStoreRow): Promise<void>;
  save(row: TripadvisorReviewStoreRow): Promise<void>;
  createNew(input: {
    id: string;
    mapped: MappedTripadvisorReview;
    actorUserId: string;
  }): Promise<void>;
};

/**
 * Idempotent upsert for a Terra-mapped review into the local reviews store.
 * `entityId` is the Terra review id (or hashed form ≤ 36 chars).
 */
export async function upsertSyncedTripadvisorReview(
  store: TripadvisorReviewUpsertStore,
  mapped: MappedTripadvisorReview,
  actorUserId: string,
  newId: () => string,
): Promise<TripadvisorSyncUpsertOutcome> {
  const existing = await store.findByEntityId(mapped.entityId);

  if (existing) {
    if (existing.source !== 'tripadvisor') {
      return 'skipped';
    }
    if (existing.deletedAt) {
      await store.recover(existing);
      existing.deletedAt = null;
      existing.deletedByUserId = null;
    }
    existing.rating = mapped.rating;
    existing.title = mapped.title;
    existing.body = mapped.body;
    existing.externalAuthorName = mapped.authorName;
    existing.status = 'approved';
    existing.userId = null;
    existing.updatedByUserId = actorUserId;
    if (mapped.publishedAt) {
      existing.createdAt = mapped.publishedAt;
    }
    await store.save(existing);
    return 'updated';
  }

  await store.createNew({
    id: newId(),
    mapped,
    actorUserId,
  });
  return 'imported';
}
