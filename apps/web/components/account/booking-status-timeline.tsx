'use client';

import type { BookingStatus, BookingStatusHistoryEntry } from '@africatourismgate/types';
import { bookingStatusLabels, bookingStatusStyles } from '../../lib/bookings/display';
import { formatBookingDateTime } from '../../lib/bookings/display';

const CANONICAL_STEPS: BookingStatus[] = ['draft', 'pending_payment', 'confirmed'];
const TERMINAL_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);

type StepState = 'completed' | 'current' | 'upcoming';

type TimelineLabels = {
  title: string;
  placeholder: string;
  stepCreated: string;
  stepPending: string;
  stepConfirmed: string;
  stepCancelled: string;
  stepRefunded: string;
  current: string;
  upcoming: string;
};

type Props = {
  currentStatus: BookingStatus;
  createdAt: string;
  history?: BookingStatusHistoryEntry[];
  localeTag?: string;
  labels: TimelineLabels;
};

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
  createdAt: string,
): string | null {
  if (history.length === 0) {
    if (step === 'draft') return createdAt;
    return null;
  }
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return sorted.find((entry) => entry.toStatus === step)?.createdAt ?? null;
}

function stepLabel(step: BookingStatus, labels: TimelineLabels): string {
  switch (step) {
    case 'draft':
      return labels.stepCreated;
    case 'pending_payment':
      return labels.stepPending;
    case 'confirmed':
      return labels.stepConfirmed;
    case 'cancelled':
      return labels.stepCancelled;
    case 'refunded':
      return labels.stepRefunded;
    default:
      return bookingStatusLabels[step] ?? step;
  }
}

function dotClass(step: BookingStatus, state: StepState): string {
  if (state === 'current') {
    return bookingStatusStyles[step]?.dot ?? 'bg-primary';
  }
  if (state === 'completed') {
    return 'bg-green-500';
  }
  return 'bg-gray-300 dark:bg-white/20';
}

function lineClass(state: StepState): string {
  if (state === 'completed') return 'bg-green-500';
  if (state === 'current') return 'bg-primary/40';
  return 'bg-gray-200 dark:bg-white/10';
}

function inferPlaceholderReached(currentStatus: BookingStatus): Set<BookingStatus> {
  const reached = new Set<BookingStatus>([currentStatus]);
  if (currentStatus === 'pending_payment' || currentStatus === 'confirmed' || currentStatus === 'cancelled' || currentStatus === 'refunded') {
    reached.add('draft');
  }
  if (currentStatus === 'confirmed' || currentStatus === 'cancelled' || currentStatus === 'refunded') {
    reached.add('pending_payment');
  }
  if (currentStatus === 'confirmed') {
    reached.add('confirmed');
  }
  return reached;
}

export function BookingStatusTimeline({
  currentStatus,
  createdAt,
  history = [],
  localeTag = 'fr-FR',
  labels,
}: Props) {
  const usingPlaceholder = history.length === 0;
  const reached = usingPlaceholder
    ? inferPlaceholderReached(currentStatus)
    : collectReachedStatuses(currentStatus, history);
  const isTerminal = TERMINAL_STATUSES.has(currentStatus);

  const steps = isTerminal
    ? [...CANONICAL_STEPS, currentStatus]
    : CANONICAL_STEPS;

  return (
    <section
      className="rounded-lg border border-atg-border bg-atg-surface p-4 dark:border-atg-border dark:bg-white/5"
      aria-label={labels.title}
    >
      <h3 className="text-sm font-semibold text-atg-fg">{labels.title}</h3>
      {usingPlaceholder ? (
        <p className="mt-1 text-xs text-atg-muted">{labels.placeholder}</p>
      ) : null}

      <ol className="mt-4 space-y-0">
        {steps.map((step, index) => {
          const state = isTerminal && step === currentStatus
            ? 'current'
            : getStepState(index, currentStatus, reached);
          const reachedAt = getStepReachedAt(step, history, createdAt);
          const isLast = index === steps.length - 1;

          return (
            <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${lineClass(
                    state === 'upcoming' ? 'upcoming' : 'completed',
                  )}`}
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-atg-surface dark:ring-white/5 ${
                  state === 'current'
                    ? `${dotClass(step, state)} scale-110`
                    : dotClass(step, state)
                }`}
                aria-hidden
              >
                {state === 'completed' ? (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10.28 2.28a.75.75 0 00-1.06-1.06L4.5 6.94 2.78 5.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z" />
                  </svg>
                ) : null}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-sm font-medium ${
                    state === 'upcoming' ? 'text-atg-muted' : 'text-atg-fg'
                  }`}
                >
                  {stepLabel(step, labels)}
                </p>
                {reachedAt ? (
                  <p className="mt-0.5 text-xs text-atg-muted">
                    {formatBookingDateTime(reachedAt, localeTag)}
                  </p>
                ) : state === 'current' ? (
                  <p className="mt-0.5 text-xs font-medium text-primary">{labels.current}</p>
                ) : state === 'upcoming' ? (
                  <p className="mt-0.5 text-xs text-atg-muted">{labels.upcoming}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
