'use client';

import type { Translations } from '../../lib/i18n/translations';

export type PackageCompositionStep = 'overview' | 'configure' | 'recap';

type PackageCompositionStepperProps = {
  step: PackageCompositionStep;
  configuredCount: number;
  totalCount: number;
  t: Translations['packages'];
};

const STEPS: PackageCompositionStep[] = ['overview', 'configure', 'recap'];

function stepLabel(step: PackageCompositionStep, t: Translations['packages']): string {
  switch (step) {
    case 'overview':
      return t.stepOverview;
    case 'configure':
      return t.stepConfigure;
    case 'recap':
      return t.stepRecap;
  }
}

function stepShortLabel(step: PackageCompositionStep, t: Translations['packages']): string {
  switch (step) {
    case 'overview':
      return t.stepOverviewShort;
    case 'configure':
      return t.stepConfigureShort;
    case 'recap':
      return t.stepRecapShort;
  }
}

export function PackageCompositionStepper({
  step,
  configuredCount,
  totalCount,
  t,
}: PackageCompositionStepperProps) {
  const currentIndex = STEPS.indexOf(step);

  return (
    <nav aria-label={t.compositionStepperAria} className="rounded-2xl border border-atg-border bg-atg-elevated p-4 dark:border-atg-border dark:bg-atg-elevated">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {STEPS.map((entry, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = entry === step;
          const stepNumber = index + 1;

          return (
            <li key={entry} className="flex min-w-0 flex-1 items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCurrent
                    ? 'bg-primary text-white'
                    : isComplete
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                      : 'bg-atg-surface text-atg-muted dark:bg-atg-surface/80'
                }`}
                aria-hidden
              >
                {isComplete ? '✓' : stepNumber}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${isCurrent ? 'text-atg-fg' : 'text-atg-muted'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="hidden sm:inline">{stepLabel(entry, t)}</span>
                  <span className="sm:hidden">{stepShortLabel(entry, t)}</span>
                </p>
                {entry === 'configure' && totalCount > 0 ? (
                  <p className="text-xs text-atg-muted">
                    {t.configureProgress.replace('{done}', String(configuredCount)).replace('{total}', String(totalCount))}
                  </p>
                ) : null}
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  className="hidden h-px flex-1 bg-atg-border sm:block dark:bg-atg-border"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
