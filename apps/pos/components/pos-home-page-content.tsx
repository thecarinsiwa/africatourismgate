'use client';

import { useLayoutEffect, useState } from 'react';
import { PosHomeActions } from './pos-home-actions';
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

export function PosHomePageContent() {
  const session = usePosSession();
  const firstName = session?.user.firstName?.trim() || 'Employé';
  const organization = session?.selectedOrganizationName?.trim();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-atg-fg md:text-3xl">
          {resolveGreeting()}, {firstName}
        </h1>
        <p className="mt-2 text-sm text-atg-muted md:text-base">
          {posHomeConfig.title}
          {organization ? (
            <>
              {' '}
              — <span className="font-medium text-atg-fg">{organization}</span>
            </>
          ) : null}
        </p>
      </header>

      <PosHomeActions />
    </div>
  );
}
