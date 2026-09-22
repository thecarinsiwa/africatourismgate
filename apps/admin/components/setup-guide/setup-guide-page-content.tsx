'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useSetAdminPageMeta } from '../admin-page-meta-context';
import {
  getSetupModulesInOrder,
  type SetupModuleId,
} from '../../lib/setup-guide/setup-catalog';

/**
 * Coquille layout « Mise en route » (2 colonnes).
 * Nav modules (s05), cartes d’étapes (s06) et readiness live (s09) viendront remplacer les placeholders.
 */
export function SetupGuidePageContent() {
  const t = useTranslations('pages.mise-en-route');
  useSetAdminPageMeta({ title: t('title') });

  const modules = useMemo(() => getSetupModulesInOrder(), []);
  const [activeModuleId, setActiveModuleId] = useState<SetupModuleId>(
    () => modules[0]?.id ?? 'platform',
  );

  const activeModule =
    modules.find((module) => module.id === activeModuleId) ?? modules[0];

  const totalStepCount = useMemo(
    () => modules.reduce((sum, module) => sum + module.steps.length, 0),
    [modules],
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
          {t('progressSummary', { ready: 0, total: totalStepCount })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside
          className="min-w-0 rounded-lg border border-atg-border bg-atg-elevated p-3"
          aria-label={t('modulesHeading')}
          data-slot="setup-module-nav"
        >
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {t('modulesHeading')}
          </h2>
          <ul className="space-y-1">
            {modules.map((module) => {
              const isActive = module.id === activeModule?.id;
              return (
                <li key={module.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModuleId(module.id)}
                    className={
                      isActive
                        ? 'w-full rounded-md bg-primary/10 px-3 py-2 text-left text-sm font-medium text-primary'
                        : 'w-full rounded-md px-3 py-2 text-left text-sm text-atg-fg hover:bg-atg-muted/10'
                    }
                    aria-current={isActive ? 'true' : undefined}
                    data-module-id={module.id}
                  >
                    <span className="block truncate">{module.id}</span>
                    <span className="mt-0.5 block text-xs text-atg-muted">
                      {t('stepsCount', { count: module.steps.length })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section
          className="min-w-0 space-y-4"
          aria-label={t('stepsHeading')}
          data-slot="setup-steps"
        >
          {activeModule ? (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-atg-fg">
                  {activeModule.id}
                </h2>
                <p className="text-sm text-atg-muted">
                  {t('stepsCount', { count: activeModule.steps.length })}
                </p>
              </div>
              <ol className="space-y-3">
                {activeModule.steps.map((step, index) => (
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
