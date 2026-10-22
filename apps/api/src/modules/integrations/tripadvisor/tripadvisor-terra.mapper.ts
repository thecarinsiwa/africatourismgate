import { createHash } from 'node:crypto';
import type { TerraLocationReview } from './tripadvisor-terra.types';

const TITLE_MAX = 180;
const AUTHOR_MAX = 120;
const ENTITY_ID_MAX = 36;

export interface MappedTripadvisorReview {
  entityId: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  publishedAt: Date | null;
}

/**
 * Maps a Terra review item to our Reviews row fields.
 * Returns null when the review has no usable id or body text.
 */
export function mapTerraReviewToTripadvisor(
  item: TerraLocationReview,
): MappedTripadvisorReview | null {
  const rawId =
    item.id === undefined || item.id === null ? '' : String(item.id).trim();
  if (!rawId) return null;

  const body = typeof item.text === 'string' ? item.text.trim() : '';
  if (!body) return null;

  const rating = normalizeRating(item.rating);
  if (rating == null) return null;

  const titleRaw = typeof item.title === 'string' ? item.title.trim() : '';
  const title = titleRaw ? titleRaw.slice(0, TITLE_MAX) : null;

  const authorName = resolveAuthorName(item).slice(0, AUTHOR_MAX);
  if (!authorName) return null;

  return {
    entityId: toEntityId(rawId),
    rating,
    title,
    body,
    authorName,
    publishedAt: parsePublishedAt(item),
  };
}

export function toEntityId(terraReviewId: string): string {
  if (terraReviewId.length <= ENTITY_ID_MAX) {
    return terraReviewId;
  }
  return createHash('sha256')
    .update(terraReviewId)
    .digest('hex')
    .slice(0, ENTITY_ID_MAX);
}

function normalizeRating(raw: unknown): number | null {
  const n = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function resolveAuthorName(item: TerraLocationReview): string {
  const user = item.user;
  if (!user || typeof user !== 'object') {
    return 'Voyageur Tripadvisor';
  }
  for (const key of ['username', 'display_name', 'name'] as const) {
    const value = user[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return 'Voyageur Tripadvisor';
}

function parsePublishedAt(item: TerraLocationReview): Date | null {
  const raw =
    (typeof item.published_date === 'string' && item.published_date.trim()) ||
    (typeof item.publish_ts === 'string' && item.publish_ts.trim()) ||
    (typeof item.published_at === 'string' && item.published_at.trim()) ||
    '';
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
