'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Avatar,
  Button,
  DataTableBadge,
  Input,
  Modal,
  Skeleton,
  useToast,
} from '@africatourismgate/ui';
import type { GuideCalendarDayStatus, TourGuideCalendarDayGuide } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { formatDateLabel } from '../../lib/availability-dates';
import { getApiClient } from '../../lib/auth/api';
import {
  parseGuideScheduleConflictError,
  type ParsedGuideScheduleConflictError,
} from '../../lib/guide-schedule-errors';
import { useBookingGuideRoleLabels } from '../../lib/i18n/use-module-labels';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { combineDateAndTime, GuideDayTimeline } from './guide-day-timeline';

const STATUS_VARIANTS: Record<GuideCalendarDayStatus, 'success' | 'warning' | 'muted'> = {
  available: 'success',
  occupied: 'warning',
  unavailable: 'muted',
};

type UnavailForm = {
  startTime: string;
  endTime: string;
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

function ConflictNotice({ error, t }: { error: ParsedGuideScheduleConflictError; t: ReturnType<typeof useTranslations<'modules.tourGuides.calendar.dayModal'>> }) {
  return (
    <p role="alert" className="rounded-md border border-amber-300/60 bg-amber-50 px-2 py-1.5 text-xs text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100">
      {error.message}
      {error.conflicts.length > 0 ? (
        <span className="mt-1 block">
          {error.conflicts.map((c) => (
            <span key={c.id} className="block">
              {c.kind === 'assignment' ? t('conflictAssignment') : t('conflictUnavailable')}
            </span>
          ))}
        </span>
      ) : null}
    </p>
  );
}

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
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [unavailForms, setUnavailForms] = useState<Record<string, UnavailForm>>({});
  const [formConflict, setFormConflict] = useState<ParsedGuideScheduleConflictError | null>(null);

  const load = useCallback(async () => {
    if (!date) return;
    setState({ status: 'loading' });
    try {
      const detail = await getApiClient().getTourGuideCalendarDay({
        date,
        destinationId,
        organizationId,
      });
      setState({
        status: 'ready',
        guides: detail.guides.map((guide) => ({
          ...guide,
          slots: guide.slots ?? [],
        })),
      });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [date, destinationId, getTourGuidesErrorMessage, organizationId]);

  useEffect(() => {
    if (!open || !date) {
      setState({ status: 'idle' });
      setExpandedGuideId(null);
      setFormConflict(null);
      return;
    }
    void load();
  }, [date, load, open]);

  function getUnavailForm(guideId: string): UnavailForm {
    return unavailForms[guideId] ?? { startTime: '09:00', endTime: '12:00' };
  }

  async function handleMarkUnavailable(guide: TourGuideCalendarDayGuide) {
    if (!date || !canWrite) return;
    const form = getUnavailForm(guide.guideId);
    if (form.startTime >= form.endTime) {
      setFormConflict(null);
      toast({
        variant: 'error',
        title: tToast('saveError'),
        message: t('validation.endAfterStart'),
      });
      return;
    }

    setSavingGuideId(guide.guideId);
    setFormConflict(null);
    try {
      const from = combineDateAndTime(date, form.startTime);
      const to = combineDateAndTime(date, form.endTime);
      await getApiClient().upsertGuideAvailability(guide.guideId, {
        startDatetime: from,
        endDatetime: to,
        status: 'unavailable',
      });
      toast({
        variant: 'success',
        title: tToast('tourGuideSavedTitle'),
        message: guide.displayName,
      });
      setExpandedGuideId(null);
      await load();
      onUpdated();
    } catch (error) {
      const conflict = parseGuideScheduleConflictError(error);
      if (conflict) {
        setFormConflict(conflict);
      } else {
        toast({
          variant: 'error',
          title: tToast('saveError'),
          message: getTourGuidesErrorMessage(error),
        });
      }
    } finally {
      setSavingGuideId(null);
    }
  }

  async function handleClearUnavailable(guide: TourGuideCalendarDayGuide) {
    if (!date || !canWrite) return;
    const unavailableSlot = guide.slots.find((slot) => slot.type === 'unavailable');
    if (!unavailableSlot) return;

    setSavingGuideId(guide.guideId);
    setFormConflict(null);
    try {
      await getApiClient().upsertGuideAvailability(guide.guideId, {
        startDatetime: unavailableSlot.startDatetime,
        endDatetime: unavailableSlot.endDatetime,
        status: 'available',
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
      className="max-w-3xl"
    >
      {state.status === 'loading' || state.status === 'idle' ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
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
            const isSaving = savingGuideId === guide.guideId;
            const photoSrc = guide.photoUrl?.trim()
              ? resolveMediaUrl(guide.photoUrl.trim())
              : undefined;
            const hasUnavailable = guide.slots.some((slot) => slot.type === 'unavailable');
            const isExpanded = expandedGuideId === guide.guideId;
            const form = getUnavailForm(guide.guideId);

            return (
              <li key={guide.guideId} className="space-y-3 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {guide.bookingId ? (
                      <Button href={`/reservations/${guide.bookingId}`} variant="outline" size="sm">
                        {t('viewBooking')}
                      </Button>
                    ) : null}
                    <Link
                      href={`/guides/${guide.guideId}`}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      {t('viewGuide')}
                    </Link>
                  </div>
                </div>

                {date ? (
                  <GuideDayTimeline date={date} slots={guide.slots} />
                ) : null}

                {canWrite ? (
                  <div className="rounded-lg border border-atg-border bg-atg-elevated/40 p-3">
                    {!isExpanded ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormConflict(null);
                            setExpandedGuideId(guide.guideId);
                          }}
                        >
                          {t('addUnavailability')}
                        </Button>
                        {hasUnavailable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSaving}
                            loading={isSaving}
                            onClick={() => void handleClearUnavailable(guide)}
                          >
                            {t('clearUnavailability')}
                          </Button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-atg-fg">{t('unavailabilityFormTitle')}</p>
                        {formConflict && expandedGuideId === guide.guideId ? (
                          <ConflictNotice error={formConflict} t={t} />
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label={t('startTime')}
                            type="time"
                            value={form.startTime}
                            onChange={(event) =>
                              setUnavailForms((current) => ({
                                ...current,
                                [guide.guideId]: {
                                  ...getUnavailForm(guide.guideId),
                                  startTime: event.target.value,
                                },
                              }))
                            }
                          />
                          <Input
                            label={t('endTime')}
                            type="time"
                            value={form.endTime}
                            onChange={(event) =>
                              setUnavailForms((current) => ({
                                ...current,
                                [guide.guideId]: {
                                  ...getUnavailForm(guide.guideId),
                                  endTime: event.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            loading={isSaving}
                            onClick={() => void handleMarkUnavailable(guide)}
                          >
                            {t('saveUnavailability')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            onClick={() => {
                              setExpandedGuideId(null);
                              setFormConflict(null);
                            }}
                          >
                            {tActions('cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </Modal>
  );
}
