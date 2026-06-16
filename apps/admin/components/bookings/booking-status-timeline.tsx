'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type { BookingStatus, BookingStatusHistoryEntry } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  BOOKING_STATUS_VARIANTS,
  getBookingStatusLabel,
} from '../../lib/booking-status';
import { useBookingStatusLabels } from '../../lib/i18n/use-module-labels';

const CANONICAL_STEPS: BookingStatus[] = ['draft', 'pending_payment', 'confirmed'];
const TERMINAL_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);

type StepState = 'completed' | 'current' | 'upcoming';

export type BookingStatusTimelineProps = {
  currentStatus: BookingStatus;
  history: BookingStatusHistoryEntry[];
  className?: string;
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function collectReachedStatuses(
  currentStatus: BookingStatus,
  history: BookingStatusHistoryEntry[],
): Set<BookingStatus> {
  const reached = new Set<BookingStatus>([currentStatus]);
  for (const entry of history) {
    reached.add(entry.toStatus);
    if (entry.fromStatus) reached.add(entry.fromStatus);
  }
  return reached;
}

function getStepState(
  stepIndex: number,
  currentStatus: BookingStatus,
  reached: Set<BookingStatus>,
): StepState {
  const step = CANONICAL_STEPS[stepIndex];
  if (currentStatus === step) return 'current';

  const currentCanonicalIndex = CANONICAL_STEPS.indexOf(currentStatus);
  if (currentCanonicalIndex >= 0) {
    if (stepIndex < currentCanonicalIndex) return 'completed';
    return 'upcoming';
  }

  const maxReachedCanonical = CANONICAL_STEPS.reduce(
    (max, status, index) => (reached.has(status) ? index : max),
    -1,
  );
  if (stepIndex <= maxReachedCanonical) return 'completed';
  return 'upcoming';
}

function getStepReachedAt(
  step: BookingStatus,
  history: BookingStatusHistoryEntry[],
): string | null {
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return sorted.find((entry) => entry.toStatus === step)?.createdAt ?? null;
}

function stepDotClass(step: BookingStatus, state: StepState): string {
  if (state === 'current') {
    return 'border-primary bg-primary text-white ring-4 ring-primary/20';
  }
  if (state === 'completed') {
    const variant = BOOKING_STATUS_VARIANTS[step];
    if (variant === 'success') return 'border-green-600 bg-green-600 text-white';
    if (variant === 'warning') return 'border-amber-500 bg-amber-500 text-white';
    return 'border-atg-muted bg-atg-muted text-atg-elevated';
  }
  return 'border-atg-border bg-atg-elevated text-atg-muted';
}

function StepNode({
  step,
  state,
  reachedAt,
  showConnector,
  connectorCompleted,
  statusLabels,
}: {
  step: BookingStatus;
  state: StepState;
  reachedAt: string | null;
  showConnector?: boolean;
  connectorCompleted?: boolean;
  statusLabels: ReturnType<typeof useBookingStatusLabels>;
}) {
  const label = getBookingStatusLabel(step, statusLabels);

  return (
    <div className="flex min-w-0 flex-1 items-start gap-0">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums',
            stepDotClass(step, state),
          )}
          aria-hidden
        >
          {state === 'completed' ? '✓' : CANONICAL_STEPS.indexOf(step) + 1}
        </span>
        <div className="min-w-0 px-1">
          <p
            className={cn(
              'text-xs font-medium sm:text-sm',
              state === 'upcoming' ? 'text-atg-muted' : 'text-atg-fg',
            )}
          >
            {label}
          </p>
          {reachedAt ? (
            <p className="mt-0.5 text-[11px] tabular-nums text-atg-muted sm:text-xs">
              {formatDateTime(reachedAt)}
            </p>
          ) : null}
        </div>
      </div>
      {showConnector ? (
        <div
          className={cn(
            'mt-4 hidden h-0.5 min-w-[1rem] flex-1 sm:block',
            connectorCompleted ? 'bg-primary/60' : 'bg-atg-border',
          )}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function HistoryItem({
  entry,
  statusLabels,
  emptyDash,
}: {
  entry: BookingStatusHistoryEntry;
  statusLabels: ReturnType<typeof useBookingStatusLabels>;
  emptyDash: string;
}) {
  const t = useTranslations('modules.bookings.timeline');
  const fromLabel = entry.fromStatus
    ? getBookingStatusLabel(entry.fromStatus, statusLabels)
    : emptyDash;
  const toLabel = getBookingStatusLabel(entry.toStatus, statusLabels);

  return (
    <li className="relative border-l-2 border-atg-border py-3 pl-5 last:pb-0">
      <span
        className="absolute -left-[5px] top-4 h-2 w-2 rounded-full bg-primary"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <time className="text-xs tabular-nums text-atg-muted">
          {formatDateTime(entry.createdAt)}
        </time>
        <DataTableBadge variant={BOOKING_STATUS_VARIANTS[entry.toStatus]}>
          {toLabel}
        </DataTableBadge>
      </div>
      <p className="mt-1 text-sm text-atg-fg">
        {t('transition', { fromStatus: fromLabel, toStatus: toLabel })}
      </p>
      {entry.reason ? (
        <p className="mt-1 text-xs text-atg-muted">{entry.reason}</p>
      ) : null}
    </li>
  );
}

export function BookingStatusTimeline({
  currentStatus,
  history,
  className,
}: BookingStatusTimelineProps) {
  const t = useTranslations('modules.bookings.timeline');
  const tCommon = useTranslations('modules.common');
  const statusLabels = useBookingStatusLabels();
  const emptyDash = tCommon('empty.dash');

  const reached = useMemo(
    () => collectReachedStatuses(currentStatus, history),
    [currentStatus, history],
  );

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [history],
  );

  const isTerminal = TERMINAL_STATUSES.has(currentStatus);

  return (
    <div className={cn('space-y-6', className)}>
      <div role="group" aria-label={t('progressAria')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
          {CANONICAL_STEPS.map((step, index) => {
            const state = getStepState(index, currentStatus, reached);
            const reachedAt = getStepReachedAt(step, history);
            const nextState =
              index < CANONICAL_STEPS.length - 1
                ? getStepState(index + 1, currentStatus, reached)
                : null;
            const connectorCompleted =
              state === 'completed' || (state === 'current' && nextState !== 'upcoming');

            return (
              <div key={step} className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-start">
                <StepNode
                  step={step}
                  state={state}
                  reachedAt={reachedAt}
                  showConnector={index < CANONICAL_STEPS.length - 1}
                  connectorCompleted={connectorCompleted}
                  statusLabels={statusLabels}
                />
                {index < CANONICAL_STEPS.length - 1 ? (
                  <div
                    className={cn(
                      'ml-4 h-6 w-px sm:hidden',
                      connectorCompleted ? 'bg-primary/60' : 'bg-atg-border',
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {isTerminal ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-atg-border pt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {t('finalStatus')}
            </span>
            <DataTableBadge variant={BOOKING_STATUS_VARIANTS[currentStatus]}>
              {getBookingStatusLabel(currentStatus, statusLabels)}
            </DataTableBadge>
          </div>
        ) : null}
      </div>

      {sortedHistory.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-atg-fg">{t('history')}</h3>
          <ul className="m-0 list-none p-0" aria-label={t('historyAria')}>
            {sortedHistory.map((entry) => (
              <HistoryItem
                key={entry.id}
                entry={entry}
                statusLabels={statusLabels}
                emptyDash={emptyDash}
              />
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-atg-muted">{t('historyEmpty')}</p>
      )}
    </div>
  );
}
