'use client';

import { useLayoutEffect, useState } from 'react';
import { posHomeConfig } from '../config/home';
import { AUTH_CHANGED_EVENT, getSession, type PosStoredSession } from '../lib/auth/session';

const { greeting: greetingLabels } = posHomeConfig;

function usePosSession(): PosStoredSession | null {
  const [session, setSession] = useState<PosStoredSession | null>(null);

  useLayoutEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return session;
}

function resolveGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return greetingLabels.morning;
  if (hour < 18) return greetingLabels.afternoon;
  return greetingLabels.evening;
}

export function PosHomeHero() {
  const session = usePosSession();
  const firstName = session?.user.firstName?.trim() || 'Employé';
  const organization = session?.selectedOrganizationName?.trim() || '—';

  return (
    <section className="relative overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated px-6 py-7 shadow-sm md:px-8 md:py-8">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-secondary/10"
        aria-hidden
      />

      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {posHomeConfig.title}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-atg-fg md:text-4xl">
          {resolveGreeting()},{' '}
          <span className="text-primary">{firstName}</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-atg-muted md:text-lg">
          {posHomeConfig.subtitle}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-atg-border bg-atg-surface/80 px-4 py-2 text-sm">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
          <span className="text-atg-muted">{posHomeConfig.orgBadgeLabel}</span>
          <span className="font-semibold text-atg-fg">{organization}</span>
        </div>
      </div>
    </section>
  );
}
