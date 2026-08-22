'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Avatar,
  Button,
  DataTableBadge,
  Modal,
  Skeleton,
  Switch,
  useToast,
} from '@africatourismgate/ui';
import type {
  GuideCalendarDayStatus,
  TourGuideCalendarDayGuide,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { formatDateLabel } from '../../lib/availability-dates';
import { getApiClient } from '../../lib/auth/api';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import {
  useBookingGuideRoleLabels,
} from '../../lib/i18n/use-module-labels';

const STATUS_VARIANTS: Record<
  GuideCalendarDayStatus,
  'success' | 'warning' | 'muted'
> = {
  available: 'success',
  occupied: 'warning',
  unavailable: 'muted',
};

type TourGuideCalendarDayModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  destinationId?: string;
  organizationId?: string;
  canWrite: boolean;
  onUpdated: () => void;
};

export function TourGuideCalendarDayModal({
  open,
  onOpenChange,
  date,
  destinationId,
  organizationId,
  canWrite,
  onUpdated,
}: TourGuideCalendarDayModalProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.calendar.dayModal');
  const tToast = useTranslations('modules.common.toast');
  const tActions = useTranslations('common.actions');
  const roleLabels = useBookingGuideRoleLabels();
  const { toast } = useToast();
  const listId = useId();

  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; guides: TourGuideCalendarDayGuide[] }
  >({ status: 'idle' });
  const [savingGuideId, setSavingGuideId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!date) return;
    setState({ status: 'loading' });
    try {
      const detail = await getApiClient().getTourGuideCalendarDay({
        date,
        destinationId,
        organizationId,
      });
      setState({ status: 'ready', guides: detail.guides });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [date, destinationId, getTourGuidesErrorMessage, organizationId]);

  useEffect(() => {
    if (!open || !date) {
      setState({ status: 'idle' });
      return;
    }
    void load();
  }, [date, load, open]);

  async function handleToggleUnavailable(
    guide: TourGuideCalendarDayGuide,
    unavailable: boolean,
  ) {
    if (!date || guide.status === 'occupied' || !canWrite) return;

    setSavingGuideId(guide.guideId);
    try {
      await getApiClient().upsertGuideAvailability(guide.guideId, {
        date,
        status: unavailable ? 'unavailable' : 'available',
      });
      toast({
        variant: 'success',
        title: tToast('tourGuideSavedTitle'),
        message: guide.displayName,
      });
      await load();
      onUpdated();
    } catch (error) {
      toast({
        variant: 'error',
        title: tToast('saveError'),
        message: getTourGuidesErrorMessage(error),
      });
    } finally {
      setSavingGuideId(null);
    }
  }

  const dateLabel = date ? formatDateLabel(date) : '';

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={date ? t('title', { date: dateLabel }) : undefined}
      description={t('intro')}
      showClose
      closeAriaLabel={tActions('close')}
      className="max-w-xl"
    >
      {state.status === 'loading' || state.status === 'idle' ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      {state.status === 'ready' && state.guides.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      ) : null}

      {state.status === 'ready' && state.guides.length > 0 ? (
        <ul id={listId} className="divide-y divide-atg-border">
          {state.guides.map((guide) => {
            const isOccupied = guide.status === 'occupied';
            const isUnavailable = guide.status === 'unavailable';
            const isSaving = savingGuideId === guide.guideId;
            const photoSrc = guide.photoUrl?.trim()
              ? resolveMediaUrl(guide.photoUrl.trim())
              : undefined;

            return (
              <li
                key={guide.guideId}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    email={`${guide.guideId}@guide`}
                    firstName={guide.displayName}
                    src={photoSrc}
                    size="md"
                    label={guide.displayName}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-atg-fg">{guide.displayName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <DataTableBadge variant={STATUS_VARIANTS[guide.status]}>
                        {t(`status.${guide.status}`)}
                      </DataTableBadge>
                      {guide.role ? (
                        <span className="text-xs text-atg-muted">{roleLabels[guide.role]}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                  {isOccupied && guide.bookingId ? (
                    <Button href={`/reservations/${guide.bookingId}`} variant="outline" size="sm">
                      {t('viewBooking')}
                    </Button>
                  ) : null}

                  {canWrite && !isOccupied ? (
                    <Switch
                      id={`${listId}-${guide.guideId}`}
                      label={t('unavailableToggle')}
                      checked={isUnavailable}
                      disabled={isSaving}
                      onChange={(event) =>
                        void handleToggleUnavailable(guide, event.target.checked)
                      }
                    />
                  ) : null}

                  {!canWrite && !isOccupied ? (
                    <Link
                      href={`/guides/${guide.guideId}`}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      {t('viewGuide')}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Modal>
  );
}
