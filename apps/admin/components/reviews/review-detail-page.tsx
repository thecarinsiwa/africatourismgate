'use client';

import { Button, Card, DataTableBadge } from '@africatourismgate/ui';
import type { AdminReviewDetail, ReviewStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { getReviewsErrorMessage } from '../../lib/reviews-errors';

const statusLabels: Record<ReviewStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  hidden: 'Masqué',
};

const statusVariants: Record<ReviewStatus, 'success' | 'warning' | 'muted'> = {
  pending: 'warning',
  approved: 'success',
  hidden: 'muted',
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

type ReviewDetailPageProps = {
  reviewId: string;
};

export function ReviewDetailPage({ reviewId }: ReviewDetailPageProps) {
  const [canWrite, setCanWrite] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; review: AdminReviewDetail }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Avis',
    entityLabel:
      state.status === 'ready'
        ? `${state.review.rating}/5 — ${state.review.authorFirstName ?? state.review.authorEmail ?? state.review.id.slice(0, 8)}`
        : undefined,
  });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const review = await getApiClient().getReview(reviewId);
      setState({ status: 'ready', review });
    } catch (error) {
      setState({ status: 'error', message: getReviewsErrorMessage(error) });
    }
  }, [reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(
            me.isSuperAdmin || me.permissions.includes('reviews.write'),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runAction = useCallback(
    async (action: 'approve' | 'hide' | 'delete') => {
      if (state.status !== 'ready') return;
      if (action === 'delete') {
        if (!window.confirm('Supprimer cet avis (suppression logique) ?')) return;
      }
      setActionError(null);
      setActing(true);
      try {
        const client = getApiClient();
        if (action === 'approve') {
          await client.updateReviewStatus(reviewId, { status: 'approved' });
        } else if (action === 'hide') {
          await client.updateReviewStatus(reviewId, { status: 'hidden' });
        } else {
          await client.deleteReview(reviewId);
          window.location.href = '/contenu/avis';
          return;
        }
        await load();
      } catch (error) {
        setActionError(getReviewsErrorMessage(error));
      } finally {
        setActing(false);
      }
    },
    [load, reviewId, state.status],
  );

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">Chargement…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
        <Button href="/contenu/avis" variant="ghost" size="sm">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const { review } = state;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <DataTableBadge variant={statusVariants[review.status]}>
          {statusLabels[review.status]}
        </DataTableBadge>
      </div>

      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      <Card className="p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-atg-fg">{review.rating}/5</p>
            <p className="mt-1 text-sm text-atg-muted">
              Publié le {formatDateTime(review.createdAt)}
            </p>
          </div>
          {canWrite ? (
            <div className="flex flex-wrap gap-2">
              {review.status !== 'approved' ? (
                <Button
                  type="button"
                  disabled={acting}
                  loading={acting}
                  loadingText="…"
                  onClick={() => void runAction('approve')}
                >
                  Approuver
                </Button>
              ) : null}
              {review.status !== 'hidden' ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={acting}
                  onClick={() => void runAction('hide')}
                >
                  Masquer
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                disabled={acting}
                onClick={() => void runAction('delete')}
                className="!text-red-600 hover:!bg-red-50 dark:!text-red-400"
              >
                Supprimer
              </Button>
            </div>
          ) : null}
        </div>

        {review.title ? (
          <h2 className="text-lg font-semibold text-atg-fg">{review.title}</h2>
        ) : null}
        {review.body ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-atg-muted">
            {review.body}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-atg-muted">Aucun commentaire.</p>
        )}

        <dl className="mt-8 grid gap-4 border-t border-atg-border pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              Auteur
            </dt>
            <dd className="mt-1 text-sm text-atg-fg">
              {review.authorFirstName?.trim() || '—'}
              {review.authorEmail ? (
                <span className="block text-atg-muted">{review.authorEmail}</span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              Entité
            </dt>
            <dd className="mt-1 font-mono text-sm text-atg-fg">
              {review.entityType} · {review.entityId}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              Propriété
            </dt>
            <dd className="mt-1 text-sm text-atg-fg">
              {review.propertyName ?? '—'}
            </dd>
          </div>
          {review.entityType === 'booking' ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                Réservation
              </dt>
              <dd className="mt-1">
                <Link
                  href={`/dashboard/bookings/${review.entityId}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir la réservation
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </Card>
    </div>
  );
}
