'use client';

import Link from 'next/link';
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

/**
 * Coquille layout « Mise en route » (2 colonnes).
 * Cartes d’étapes (s06) et readiness live (s09) à brancher ensuite.
 */
export function SetupGuidePageContent() {
  const t = useTranslations('pages.mise-en-route');
  useSetAdminPageMeta({ title: t('title') });

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

  return (
    <div className="min-w-0 space-y-6" data-testid="setup-guide-page">
      <header className="space-y-2 border-b border-atg-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-base text-atg-muted sm:text-lg">
          {t('description')}
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
                  {activeModuleProgress.module.id}
                </h2>
                <p className="text-sm text-atg-muted">
                  {t('moduleProgress', {
                    ready: activeModuleProgress.readyCount,
                    total: activeModuleProgress.stepCount,
                  })}
                </p>
              </div>
              <ol className="space-y-3">
                {activeModuleProgress.steps.map((stepProgress, index) => {
                  const { step } = stepProgress;
                  return (
                    <li
                      key={step.id}
                      className="rounded-lg border border-atg-border bg-atg-elevated p-4"
                      data-step-id={step.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium text-atg-fg">
                            <span className="mr-2 tabular-nums text-atg-muted">
                              {index + 1}.
                            </span>
                            {step.id}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={step.listHref}
                            className="inline-flex items-center rounded-md border border-atg-border px-3 py-1.5 text-xs font-medium text-atg-fg hover:bg-atg-muted/10"
                          >
                            {t('openList')}
                          </Link>
                          {step.createHref ? (
                            <Link
                              href={step.createHref}
                              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
                            >
                              {t('createItem')}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
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
