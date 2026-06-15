import type { AdminReviewListItem, ReviewStatus } from '@africatourismgate/types';

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  hidden: 'Masqué',
};

export const reviewStatusVariants: Record<
  ReviewStatus,
  'success' | 'warning' | 'muted'
> = {
  pending: 'warning',
  approved: 'success',
  hidden: 'muted',
};

export function formatReviewDateTime(
  iso: string,
  style: 'short' | 'long' = 'short',
): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: style === 'long' ? 'long' : 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatReviewEntity(
  review: Pick<AdminReviewListItem, 'entityType' | 'entityId'>,
): string {
  const shortId = review.entityId.slice(0, 8);
  return `${review.entityType} · ${shortId}…`;
}

export function truncateReviewPreview(text: string, maxLength = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

type ReviewPreviewSource = {
  title?: string | null;
  body?: string | null;
};

export function formatReviewPreview(
  source: ReviewPreviewSource,
  maxLength = 120,
): string | null {
  const title = source.title?.trim();
  if (title) {
    return truncateReviewPreview(title, maxLength);
  }

  const body = source.body?.trim();
  if (body) {
    return truncateReviewPreview(body, maxLength);
  }

  return null;
}
