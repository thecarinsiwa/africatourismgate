'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { posHomeConfig } from '../config/home';
import { clearSelectedOrganization, getSessionPersistence } from '../lib/auth/session';

const { actions } = posHomeConfig;

type ActionIconProps = {
  className?: string;
};

function SaleIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function HistoryIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function BuildingIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function ChevronIcon({ className }: ActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

type PrimaryActionCardProps = {
  label: string;
  description: string;
  onClick: () => void;
};

function PrimaryActionCard({ label, description, onClick }: PrimaryActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[7.5rem] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[var(--atg-secondary)] p-6 text-left text-white shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface md:min-h-[8.5rem] md:p-8"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-110"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/10"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <SaleIcon className="h-7 w-7" />
          </span>
          <span className="min-w-0 pt-1">
            <span className="block text-2xl font-bold tracking-tight md:text-3xl">{label}</span>
            <span className="mt-1.5 block text-sm font-medium text-white/85 md:text-base">
              {description}
            </span>
          </span>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5 group-hover:bg-white/25">
          <ChevronIcon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}

type SecondaryActionCardProps = {
  label: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
};

function SecondaryActionCard({
  label,
  description,
  icon,
  disabled,
  badge,
  onClick,
}: SecondaryActionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex min-h-[6.5rem] w-full flex-col justify-between rounded-2xl border border-atg-border bg-atg-elevated p-5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface md:min-h-[7rem] md:p-6 ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-primary/35 hover:bg-atg-surface hover:shadow-md active:scale-[0.99]'
      }`}
    >
      <div className="flex w-full items-start justify-between gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            disabled
              ? 'bg-atg-surface text-atg-muted'
              : 'bg-primary/10 text-primary group-hover:bg-primary/15'
          }`}
        >
          {icon}
        </span>
        {badge ? (
          <span className="shrink-0 rounded-full bg-atg-surface px-2.5 py-1 text-xs font-semibold text-atg-muted">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="mt-4 block">
        <span className="block text-lg font-semibold text-atg-fg md:text-xl">{label}</span>
        <span className="mt-1 block text-sm text-atg-muted">{description}</span>
      </span>
    </button>
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
    <div className="pos-touch grid gap-4 md:gap-5">
      <PrimaryActionCard
        label={actions.sale.label}
        description={actions.sale.description}
        onClick={() => router.push('/sale')}
      />

      <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
        <SecondaryActionCard
          label={actions.history.label}
          description={actions.history.description}
          icon={<HistoryIcon className="h-6 w-6" />}
          badge={actions.history.comingSoon}
          disabled
        />
        <SecondaryActionCard
          label={actions.changeOrg.label}
          description={actions.changeOrg.description}
          icon={<BuildingIcon className="h-6 w-6" />}
          onClick={handleChangeOrganization}
        />
      </div>
    </div>
  );
}
