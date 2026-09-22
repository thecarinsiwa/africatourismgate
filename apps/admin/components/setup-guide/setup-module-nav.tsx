'use client';

import { useTranslations } from 'next-intl';
import type { SetupModuleId } from '../../lib/setup-guide/setup-catalog';
import type {
  SetupModuleLockState,
  SetupModuleProgress,
} from '../../lib/setup-guide/setup-progress';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SetupModuleNavProps = {
  modules: readonly SetupModuleProgress[];
  activeModuleId: SetupModuleId | null;
  onSelectModule: (moduleId: SetupModuleId) => void;
};

function lockStateLabelKey(
  lockState: SetupModuleLockState,
): 'stateLocked' | 'stateUnlocked' | 'stateComplete' {
  switch (lockState) {
    case 'locked':
      return 'stateLocked';
    case 'complete':
      return 'stateComplete';
    default:
      return 'stateUnlocked';
  }
}

export function SetupModuleNav({
  modules,
  activeModuleId,
  onSelectModule,
}: SetupModuleNavProps) {
  const t = useTranslations('modules.setupGuide.ui');
  const tGuide = useTranslations('modules.setupGuide');

  return (
    <aside
      className="min-w-0 rounded-lg border border-atg-border bg-atg-elevated p-3"
      aria-label={t('modulesHeading')}
      data-slot="setup-module-nav"
      data-testid="setup-module-nav"
    >
      <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-atg-muted">
        {t('modulesHeading')}
      </h2>
      <ul className="space-y-1">
        {modules.map((item) => {
          const { module, lockState, readyCount, stepCount } = item;
          const isActive = module.id === activeModuleId;
          const isLocked = lockState === 'locked';
          const isComplete = lockState === 'complete';
          const stateLabel = t(lockStateLabelKey(lockState));
          const moduleTitle = tGuide(module.titleKey);

          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => onSelectModule(module.id)}
                className={
                  isActive
                    ? 'flex w-full items-start gap-2 rounded-md bg-primary/10 px-3 py-2 text-left text-sm font-medium text-primary'
                    : isLocked
                      ? 'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-atg-muted hover:bg-atg-muted/10'
                      : 'flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-atg-fg hover:bg-atg-muted/10'
                }
                aria-current={isActive ? 'true' : undefined}
                title={stateLabel}
                data-module-id={module.id}
                data-lock-state={lockState}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {isLocked ? (
                    <LockIcon className="h-3.5 w-3.5" />
                  ) : isComplete ? (
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{moduleTitle}</span>
                    <span className="shrink-0 text-xs font-normal tabular-nums text-atg-muted">
                      {t('moduleProgress', {
                        ready: readyCount,
                        total: stepCount,
                      })}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-atg-muted">
                    {stateLabel}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
