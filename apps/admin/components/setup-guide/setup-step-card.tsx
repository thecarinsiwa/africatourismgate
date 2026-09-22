'use client';

import { Button, DataTableBadge } from '@africatourismgate/ui';
import type { DataTableBadgeVariant } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import type {
  SetupStepProgress,
  SetupStepStatus,
} from '../../lib/setup-guide/setup-progress';

type SetupStepCardProps = {
  stepProgress: SetupStepProgress;
  /** Index 1-based pour l’affichage. */
  index: number;
  /** Module parent verrouillé : CTA toujours cliquables (deep-link), style atténué. */
  moduleLocked?: boolean;
};

function statusBadgeVariant(status: SetupStepStatus): DataTableBadgeVariant {
  switch (status) {
    case 'ready':
      return 'success';
    case 'empty':
      return 'warning';
    default:
      return 'muted';
  }
}

function statusLabelKey(
  status: SetupStepStatus,
): 'stepStatusReady' | 'stepStatusEmpty' | 'stepStatusUnknown' {
  switch (status) {
    case 'ready':
      return 'stepStatusReady';
    case 'empty':
      return 'stepStatusEmpty';
    default:
      return 'stepStatusUnknown';
  }
}

export function SetupStepCard({
  stepProgress,
  index,
  moduleLocked = false,
}: SetupStepCardProps) {
  const t = useTranslations('modules.setupGuide.ui');
  const tGuide = useTranslations('modules.setupGuide');
  const { step, status, total, min } = stepProgress;

  const title = tGuide(step.titleKey);
  const help = tGuide(step.helpKey);

  const showCount = step.check.kind === 'listTotal' && total != null;
  const countLabel = showCount
    ? t('stepCount', {
        total,
        min: min ?? step.check.min,
      })
    : status === 'unknown' && step.check.kind === 'listTotal'
      ? t('stepCountUnknown')
      : null;

  return (
    <li
      className={
        moduleLocked
          ? 'rounded-lg border border-atg-border bg-atg-elevated/70 p-4 opacity-90'
          : 'rounded-lg border border-atg-border bg-atg-elevated p-4'
      }
      data-step-id={step.id}
      data-step-status={status}
      data-testid="setup-step-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-atg-fg">
              <span className="mr-2 tabular-nums text-atg-muted">{index}.</span>
              {title}
            </p>
            <DataTableBadge variant={statusBadgeVariant(status)}>
              {t(statusLabelKey(status))}
            </DataTableBadge>
          </div>
          <p className="text-sm text-atg-muted">{help}</p>
          {countLabel ? (
            <p className="text-xs font-medium tabular-nums text-atg-fg">
              {countLabel}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={step.listHref} variant="outline" size="sm">
            {t('openList')}
          </Button>
          {step.createHref ? (
            <Button href={step.createHref} variant="primary" size="sm">
              {t('createItem')}
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
