'use client';

import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import { withApiClient } from '../../lib/auth/api';
import type { SetupModuleId } from '../../lib/setup-guide/setup-catalog';
import {
  createEmptySetupReadinessSnapshot,
  fetchSetupReadiness,
  type SetupReadinessSnapshot,
} from '../../lib/setup-guide/setup-readiness';
import {
  buildSetupGuideProgress,
  getSetupModuleProgressById,
} from '../../lib/setup-guide/setup-progress';
import { SetupModuleNav } from './setup-module-nav';
import { SetupStepCard } from './setup-step-card';

/**
 * Page « Mise en route » — readiness live via ApiClient (erreurs partielles → unknown).
 */
export function SetupGuidePageContent() {
  const t = useTranslations('modules.setupGuide.ui');
  const tGuide = useTranslations('modules.setupGuide');
  useSetAdminPageMeta({ title: t('pageTitle') });

  const [snapshot, setSnapshot] = useState<SetupReadinessSnapshot>(() =>
    createEmptySetupReadinessSnapshot(),
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fatalError, setFatalError] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }
    setFatalError(false);

    try {
      const next = await withApiClient((client) => fetchSetupReadiness(client));
      setSnapshot(next);
      setHasLoadedOnce(true);
    } catch {
      setFatalError(true);
      if (mode === 'initial') {
        setSnapshot(createEmptySetupReadinessSnapshot());
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const progress = useMemo(
    () => buildSetupGuideProgress(snapshot),
    [snapshot],
  );

  const [activeModuleId, setActiveModuleId] = useState<SetupModuleId>('platform');

  useEffect(() => {
    if (!progress.modules.some((item) => item.module.id === activeModuleId)) {
      const first = progress.modules[0]?.module.id;
      if (first) {
        setActiveModuleId(first);
      }
    }
  }, [progress.modules, activeModuleId]);

  const activeModuleProgress = getSetupModuleProgressById(
    progress,
    activeModuleId,
  );

  const moduleLocked = activeModuleProgress?.lockState === 'locked';
  const showPartialError =
    hasLoadedOnce &&
    !fatalError &&
    progress.modules.some((item) => item.hasUnknown);
  const busy = initialLoading || refreshing;

  const moduleTitle = activeModuleProgress
    ? tGuide(activeModuleProgress.module.titleKey)
    : '';
  const moduleDescription = activeModuleProgress
    ? tGuide(activeModuleProgress.module.descriptionKey)
    : '';

  return (
    <div className="min-w-0 space-y-6" data-testid="setup-guide-page">
      <header className="space-y-3 border-b border-atg-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
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
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={refreshing}
            loadingText={t('refreshing')}
            disabled={busy}
            onClick={() => {
              void load('refresh');
            }}
            data-testid="setup-guide-refresh"
          >
            {t('refresh')}
          </Button>
        </div>

        {initialLoading ? (
          <p className="text-sm text-atg-muted" role="status" aria-live="polite">
            {t('loading')}
          </p>
        ) : null}

        {fatalError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            {t('loadError')}
          </p>
        ) : null}

        {showPartialError ? (
          <p
            role="status"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          >
            {t('partialError')}
          </p>
        ) : null}
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
