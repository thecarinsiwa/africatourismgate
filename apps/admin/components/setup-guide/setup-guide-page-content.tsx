'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import type { SetupModuleId } from '../../lib/setup-guide/setup-catalog';
import { createEmptySetupReadinessSnapshot } from '../../lib/setup-guide/setup-readiness';
import {
  buildSetupGuideProgress,
  getSetupModuleProgressById,
} from '../../lib/setup-guide/setup-progress';
import { SetupModuleNav } from './setup-module-nav';
import { SetupStepCard } from './setup-step-card';

/**
 * Coquille layout « Mise en route » (2 colonnes).
 * Readiness live (s09) à brancher ensuite.
 */
export function SetupGuidePageContent() {
  const t = useTranslations('modules.setupGuide.ui');
  const tGuide = useTranslations('modules.setupGuide');
  useSetAdminPageMeta({ title: t('pageTitle') });

  const progress = useMemo(
    () => buildSetupGuideProgress(createEmptySetupReadinessSnapshot()),
    [],
  );

  const [activeModuleId, setActiveModuleId] = useState<SetupModuleId>(
    () => progress.modules[0]?.module.id ?? 'platform',
  );

  const activeModuleProgress = getSetupModuleProgressById(
    progress,
    activeModuleId,
  );

  const moduleLocked = activeModuleProgress?.lockState === 'locked';

  const moduleTitle = activeModuleProgress
    ? tGuide(activeModuleProgress.module.titleKey)
    : '';
  const moduleDescription = activeModuleProgress
    ? tGuide(activeModuleProgress.module.descriptionKey)
    : '';

  return (
    <div className="min-w-0 space-y-6" data-testid="setup-guide-page">
      <header className="space-y-2 border-b border-atg-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
          {t('pageTitle')}
        </h1>
        <p className="max-w-2xl text-base text-atg-muted sm:text-lg">
          {t('pageSubtitle')}
        </p>
        <p className="text-sm font-medium tabular-nums text-atg-fg">
          {t('progressSummary', {
            ready: progress.readyStepCount,
            total: progress.totalStepCount,
          })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <SetupModuleNav
          modules={progress.modules}
          activeModuleId={activeModuleId}
          onSelectModule={setActiveModuleId}
        />

        <section
          className="min-w-0 space-y-4"
          aria-label={t('stepsHeading')}
          data-slot="setup-steps"
        >
          {activeModuleProgress ? (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-atg-fg">
                  {moduleTitle}
                </h2>
                <p className="text-sm text-atg-muted">{moduleDescription}</p>
                <p className="text-sm text-atg-muted">
                  {t('moduleProgress', {
                    ready: activeModuleProgress.readyCount,
                    total: activeModuleProgress.stepCount,
                  })}
                </p>
                {moduleLocked ? (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t('moduleLockedHint')}
                  </p>
                ) : null}
              </div>
              <ol className="space-y-3">
                {activeModuleProgress.steps.map((stepProgress, index) => (
                  <SetupStepCard
                    key={stepProgress.step.id}
                    stepProgress={stepProgress}
                    index={index + 1}
                    moduleLocked={moduleLocked}
                  />
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sm text-atg-muted">{t('emptyModule')}</p>
          )}
        </section>
      </div>
    </div>
  );
}
