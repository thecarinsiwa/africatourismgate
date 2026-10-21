'use client';

import { cn, DataTableBadge } from '@africatourismgate/ui';
import type {
  ExpenseRequestStatus,
  ExpenseRequestStatusHistoryEntry,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  useExpenseRequestStatusLabels,
  useFormatDateTime,
} from '../../lib/i18n/use-module-labels';

/** Visual circuit steps (cahier des charges + domain §6) */
export const WORKFLOW_STEPS = [
  'draft',
  'submitted',
  'validated',
  'authorized',
  'disbursement',
  'justification',
  'recorded',
] as const;

export type WorkflowStep = (typeof WORKFLOW_STEPS)[number];

type StepState = 'completed' | 'current' | 'upcoming' | 'terminal';

const TERMINAL = new Set<ExpenseRequestStatus>(['rejected', 'cancelled']);

function statusToStepIndex(status: ExpenseRequestStatus): number {
  switch (status) {
    case 'draft':
      return 0;
    case 'submitted':
      return 1;
    case 'validated':
      return 2;
    case 'authorized':
      return 3;
    case 'closed':
      return 6; // recorded = last step
    case 'rejected':
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

function getStepState(
  stepIndex: number,
  currentStatus: ExpenseRequestStatus,
): StepState {
  if (TERMINAL.has(currentStatus)) return 'terminal';
  const currentIndex = statusToStepIndex(currentStatus);
  if (currentStatus === 'closed') {
    return 'completed';
  }
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  // authorized → show disbursement as next current-ish upcoming
  if (currentStatus === 'authorized' && stepIndex === 4) return 'current';
  return 'upcoming';
}

function stepDotClass(state: StepState): string {
  if (state === 'current') {
    return 'border-primary bg-primary text-white ring-4 ring-primary/20';
  }
  if (state === 'completed') {
    return 'border-green-600 bg-green-600 text-white';
  }
  if (state === 'terminal') {
    return 'border-atg-border bg-atg-elevated text-atg-muted';
  }
  return 'border-atg-border bg-atg-elevated text-atg-muted';
}

function getStepReachedAt(
  step: WorkflowStep,
  history: ExpenseRequestStatusHistoryEntry[],
): string | null {
  const statusMap: Partial<Record<WorkflowStep, ExpenseRequestStatus>> = {
    draft: 'draft',
    submitted: 'submitted',
    validated: 'validated',
    authorized: 'authorized',
    recorded: 'closed',
  };
  const target = statusMap[step];
  if (!target) return null;
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return sorted.find((entry) => entry.toStatus === target)?.createdAt ?? null;
}

type ExpenseRequestWorkflowTimelineProps = {
  currentStatus: ExpenseRequestStatus;
  history: ExpenseRequestStatusHistoryEntry[];
  className?: string;
};

export function ExpenseRequestWorkflowTimeline({
  currentStatus,
  history,
  className,
}: ExpenseRequestWorkflowTimelineProps) {
  const t = useTranslations('modules.treasury.workflow');
  const tCommon = useTranslations('modules.common');
  const statusLabels = useExpenseRequestStatusLabels();
  const formatDateTime = useFormatDateTime('short');
  const emptyDash = tCommon('empty.dash');

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [history],
  );

  const isTerminal = TERMINAL.has(currentStatus);

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="mb-4 text-sm font-semibold text-atg-fg">{t('title')}</h2>
        {isTerminal ? (
          <p className="mb-4 text-sm text-atg-muted">
            <DataTableBadge
              variant={currentStatus === 'rejected' ? 'danger' : 'muted'}
            >
              {statusLabels[currentStatus]}
            </DataTableBadge>
          </p>
        ) : null}
        <div role="group" aria-label={t('progressAria')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0">
            {WORKFLOW_STEPS.map((step, index) => {
              const state = getStepState(index, currentStatus);
              const reachedAt = getStepReachedAt(step, history);
              const showConnector = index < WORKFLOW_STEPS.length - 1;
              const connectorCompleted =
                !isTerminal &&
                (statusToStepIndex(currentStatus) > index ||
                  currentStatus === 'closed');

              return (
                <div key={step} className="flex min-w-0 flex-1 items-start gap-0">
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums',
                        stepDotClass(state),
                      )}
                      aria-hidden
                    >
                      {state === 'completed' || currentStatus === 'closed'
                        ? '✓'
                        : index + 1}
                    </span>
                    <div className="min-w-0 px-1">
                      <p
                        className={cn(
                          'text-xs font-medium sm:text-sm',
                          state === 'upcoming' || state === 'terminal'
                            ? 'text-atg-muted'
                            : 'text-atg-fg',
                        )}
                      >
                        {t(`steps.${step}`)}
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
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-atg-fg">{t('historyTitle')}</h3>
        {sortedHistory.length === 0 ? (
          <p className="text-sm text-atg-muted">{t('historyEmpty')}</p>
        ) : (
          <ul className="space-y-0">
            {sortedHistory.map((entry) => {
              const fromLabel = entry.fromStatus
                ? statusLabels[entry.fromStatus]
                : emptyDash;
              const toLabel = statusLabels[entry.toStatus];
              return (
                <li
                  key={entry.id}
                  className="relative border-l-2 border-atg-border py-3 pl-5 last:pb-0"
                >
                  <span
                    className="absolute -left-[5px] top-4 h-2 w-2 rounded-full bg-primary"
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-xs tabular-nums text-atg-muted">
                      {formatDateTime(entry.createdAt)}
                    </time>
                    <DataTableBadge
                      variant={
                        entry.toStatus === 'rejected'
                          ? 'danger'
                          : entry.toStatus === 'authorized' ||
                              entry.toStatus === 'validated' ||
                              entry.toStatus === 'closed'
                            ? 'success'
                            : 'default'
                      }
                    >
                      {toLabel}
                    </DataTableBadge>
                  </div>
                  <p className="mt-1 text-sm text-atg-fg">
                    {t('transition', { fromStatus: fromLabel, toStatus: toLabel })}
                  </p>
                  {entry.comment ? (
                    <p className="mt-1 text-xs text-atg-muted">{entry.comment}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
