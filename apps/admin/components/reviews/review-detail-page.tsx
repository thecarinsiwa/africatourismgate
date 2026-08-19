'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTableBadge,
  StarRatingDisplay,
  useToast,
} from '@africatourismgate/ui';
import type { AdminReviewDetail } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { useFormatDateTime, useReviewStatusLabels } from '../../lib/i18n/use-module-labels';
import {
  formatReviewEntity,
  reviewStatusVariants,
} from '../../lib/review-display';

function reviewEntityTypeKey(entityType: string): string {
  return `entityTypes.${entityType}`;
}

function formatReviewAuthorLabel(
  review: Pick<AdminReviewDetail, 'authorFirstName' | 'authorEmail' | 'id'>,
): string {
  const name = review.authorFirstName?.trim();
  if (name) return name;
  if (review.authorEmail) return review.authorEmail;
  return review.id.slice(0, 8);
}

type ReviewDetailPageProps = {
  reviewId: string;
};

export function ReviewDetailPage({ reviewId }: ReviewDetailPageProps) {
  const { reviews: getReviewsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.reviews');
  const tDetail = useTranslations('modules.reviews.detail');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const formatDateTime = useFormatDateTime('long');
  const statusLabels = useReviewStatusLabels();
  const router = useRouter();
  const { toast } = useToast();
  const [canWrite, setCanWrite] = useState(false);
  const [acting, setActing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; review: AdminReviewDetail }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('title'),
    entityLabel:
      state.status === 'ready'
        ? `${state.review.rating}/5 — ${formatReviewAuthorLabel(state.review)}`
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
  }, [reviewId, getReviewsErrorMessage]);

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

  const runModerationAction = useCallback(
    async (action: 'approve' | 'hide') => {
      if (state.status !== 'ready') return;

      setActionError(null);
      setActing(true);
      try {
        const client = getApiClient();
        if (action === 'approve') {
          await client.updateReviewStatus(reviewId, { status: 'approved' });
        } else {
          await client.updateReviewStatus(reviewId, { status: 'hidden' });
        }
        await load();
        toast({
          variant: 'success',
          title:
            action === 'approve'
              ? t('toast.approved.title')
              : t('toast.hidden.title'),
          message:
            action === 'approve'
              ? t('toast.approved.message')
              : t('toast.hidden.message'),
        });
      } catch (error) {
        setActionError(getReviewsErrorMessage(error));
      } finally {
        setActing(false);
      }
    },
    [load, reviewId, state.status, toast, t, getReviewsErrorMessage],
  );

  const runDelete = useCallback(async (): Promise<boolean> => {
    setActionError(null);
    setActing(true);
    try {
      await getApiClient().deleteReview(reviewId);
      toast({
        variant: 'success',
        title: t('toast.deleted.title'),
        message: t('toast.deleted.message'),
      });
      router.push('/contenu/avis');
      return true;
    } catch (error) {
      setActionError(getReviewsErrorMessage(error));
      setActing(false);
      return false;
    }
  }, [reviewId, router, toast, t, getReviewsErrorMessage]);

  const emptyDash = tCommon('empty.dash');

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tLoading('page')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <AdminPageBackLink href="/contenu/avis" label={tDetail('backLink')} />
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      </div>
    );
  }

  const { review } = state;
  const canApprove = review.status !== 'approved';
  const canHide = review.status !== 'hidden';
  const showFooter = canWrite;
  const entityTypeLabel = tDetail.has(reviewEntityTypeKey(review.entityType))
    ? tDetail(reviewEntityTypeKey(review.entityType))
    : review.entityType;
  const formattedEntity = formatReviewEntity(review, entityTypeLabel);
  const bookingHref = `/dashboard/bookings/${
    review.entityType === 'tour_guide' ? review.bookingId : review.entityId
  }`;

  return (
    <div className="space-y-6">
      <AdminPageBackLink href="/contenu/avis" label={tDetail('backLink')} />

      {actionError ? (
        <p
          className="rounded-lg border border-red-500 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-400"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.6fr)] lg:items-start">
          <Card variant="dashboard" padding="md" className="lg:sticky lg:top-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-atg-fg">{tDetail('sections.context')}</h2>
              <DataTableBadge variant={reviewStatusVariants[review.status]}>
                {statusLabels[review.status]}
              </DataTableBadge>
            </div>

            <StarRatingDisplay
              value={review.rating}
              size="md"
              showValue
              className="mb-5"
            />

            <dl className="divide-y divide-atg-border text-sm">
              <div className="grid gap-1 py-3 first:pt-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDetail('fields.author')}
                </dt>
                <dd className="font-medium text-atg-fg">
                  {review.authorFirstName?.trim() || emptyDash}
                  {review.authorEmail ? (
                    <span className="mt-0.5 block font-normal text-atg-muted">
                      {review.authorEmail}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="grid gap-1 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDetail('fields.property')}
                </dt>
                <dd className="text-atg-fg">
                  {review.propertyId && review.propertyName ? (
                    <Link
                      href={`/hebergements/${review.propertyId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {review.propertyName}
                    </Link>
                  ) : (
                    (review.propertyName ??
                      (review.entityType === 'tour_guide' && review.guideName
                        ? review.guideName
                        : emptyDash))
                  )}
                </dd>
              </div>
              <div className="grid gap-1 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDetail('fields.entity')}
                </dt>
                <dd className="font-mono text-xs text-atg-fg">{formattedEntity}</dd>
              </div>
              {review.entityType === 'booking' || review.entityType === 'tour_guide' ? (
                <div className="grid gap-1 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {tDetail('fields.booking')}
                  </dt>
                  <dd>
                    {review.entityType === 'tour_guide' && !review.bookingId ? (
                      <span className="text-atg-muted">{emptyDash}</span>
                    ) : (
                      <Link
                        href={bookingHref}
                        className="font-medium text-primary hover:underline"
                      >
                        {tDetail('viewBooking')}
                      </Link>
                    )}
                  </dd>
                </div>
              ) : null}
              {review.entityType === 'tour_guide' && review.guideName ? (
                <div className="grid gap-1 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {tDetail('fields.guide')}
                  </dt>
                  <dd>
                    {review.guideId ? (
                      <Link
                        href={`/guides/${review.guideId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {review.guideName}
                      </Link>
                    ) : (
                      <span className="text-atg-fg">{review.guideName}</span>
                    )}
                  </dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-3 last:pb-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                  {tDetail('fields.publishedAt')}
                </dt>
                <dd className="tabular-nums text-atg-fg">{formatDateTime(review.createdAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card variant="dashboard" padding="md" className="min-h-[12rem]">
            <h2 className="mb-4 text-lg font-semibold text-atg-fg">{tDetail('sections.comment')}</h2>
            {review.title ? (
              <h3 className="text-base font-semibold text-atg-fg">{review.title}</h3>
            ) : null}
            {review.body ? (
              <p
                className={`whitespace-pre-line text-sm leading-relaxed text-atg-fg/90 ${review.title ? 'mt-3' : ''}`}
              >
                {review.body}
              </p>
            ) : (
              <p className="text-sm italic text-atg-muted">{tDetail('noComment')}</p>
            )}
          </Card>
      </div>

      {showFooter ? (
        <div
          className="sticky bottom-0 z-10 -mx-4 border-t border-atg-border bg-atg-surface/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-atg-surface/90 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8"
          role="region"
          aria-label={tDetail('moderationActionsAria')}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={acting}
              onClick={() => setDeleteDialogOpen(true)}
              className="order-3 w-full sm:order-1 sm:w-auto !text-red-600 hover:!bg-red-50 dark:!text-red-400"
            >
              {t('actions.delete')}
            </Button>
            <div className="flex flex-col gap-2 sm:order-2 sm:ml-auto sm:flex-row sm:items-center">
              {canHide ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={acting}
                  loading={acting}
                  loadingText={tLoading('default')}
                  className="w-full sm:w-auto"
                  onClick={() => void runModerationAction('hide')}
                >
                  {t('actions.hide')}
                </Button>
              ) : null}
              {canApprove ? (
                <Button
                  type="button"
                  disabled={acting}
                  loading={acting}
                  loadingText={tLoading('default')}
                  className="w-full sm:w-auto"
                  onClick={() => void runModerationAction('approve')}
                >
                  {t('actions.approve')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!acting) setDeleteDialogOpen(open);
        }}
        title={t('deleteDialog.title')}
        description={t('deleteDialog.description')}
        confirmLabel={t('actions.delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={acting}
        onConfirm={() => {
          void runDelete().then((ok) => {
            if (ok) setDeleteDialogOpen(false);
          });
        }}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
