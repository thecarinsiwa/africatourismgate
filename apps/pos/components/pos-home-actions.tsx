'use client';

import { Card, cn } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { posHomeConfig } from '../config/home';
import { clearSelectedOrganization, getSessionPersistence } from '../lib/auth/session';

const { actions } = posHomeConfig;

function SaleIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

export function PosHomeActions() {
  const router = useRouter();

  function handleChangeOrganization() {
    const remember = getSessionPersistence() === 'local';
    clearSelectedOrganization(remember);
    router.refresh();
    router.push('/select-org');
  }

  return (
    <Card variant="dashboard" padding="sm">
      <h2 className="text-base font-semibold text-atg-fg">Actions rapides</h2>
      <p className="mt-1 text-sm text-atg-muted">{posHomeConfig.subtitle}</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/sale"
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-5',
            'text-center transition-colors hover:border-primary/50 hover:bg-primary/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <SaleIcon />
          </span>
          <span className="mt-3 text-sm font-semibold text-atg-fg">{actions.sale.label}</span>
          <span className="mt-0.5 text-xs text-atg-muted">{actions.sale.description}</span>
        </Link>

        <button
          type="button"
          disabled
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-atg-border bg-atg-surface/50 p-5',
            'cursor-not-allowed text-center opacity-60',
          )}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-atg-surface text-atg-muted"
            aria-hidden
          >
            <HistoryIcon />
          </span>
          <span className="mt-3 text-sm font-semibold text-atg-fg">{actions.history.label}</span>
          <span className="mt-0.5 text-xs text-atg-muted">{actions.history.comingSoon}</span>
        </button>

        <button
          type="button"
          onClick={handleChangeOrganization}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-atg-border bg-atg-surface/50 p-5 sm:col-span-2',
            'text-center transition-colors hover:border-primary/30 hover:bg-atg-surface',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          )}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <BuildingIcon />
          </span>
          <span className="mt-3 text-sm font-semibold text-atg-fg">{actions.changeOrg.label}</span>
          <span className="mt-0.5 text-xs text-atg-muted">{actions.changeOrg.description}</span>
        </button>
      </div>
    </Card>
  );
}
