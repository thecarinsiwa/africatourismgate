'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import type { Organization } from '@africatourismgate/types';
import { Button } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { posSelectOrgPageConfig } from '../config/select-org';
import { getValidApiClient } from '../lib/auth/api';
import { logout } from '../lib/auth/logout';
import {
  getSessionPersistence,
  setSelectedOrganization,
} from '../lib/auth/session';

const {
  loadingLabel,
  autoSkipLabel,
  emptyTitle,
  emptyMessage,
  loadError,
  logoutLabel,
  currencyLabel,
} = posSelectOrgPageConfig;

function isActiveOrganization(org: Organization): boolean {
  return org.status === 'active';
}

async function fetchOrganizations(): Promise<Organization[]> {
  const client = await getValidApiClient();
  const organizations = await client.listAuthOrganizations();
  return organizations.filter(isActiveOrganization);
}

function organizationSubtitle(org: Organization): string | null {
  const parts: string[] = [];
  if (org.currency) {
    parts.push(`${currencyLabel} ${org.currency}`);
  }
  if (org.contactEmail) {
    parts.push(org.contactEmail);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function PosOrgSelect() {
  const router = useRouter();
  const autoSkipStarted = useRef(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSkipping, setAutoSkipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const confirmOrganization = useCallback(
    (org: Organization) => {
      const remember = getSessionPersistence() === 'local';
      setSelectedOrganization({ id: org.id, name: org.name, slug: org.slug }, remember);
      router.refresh();
      router.push('/');
    },
    [router],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const orgs = await fetchOrganizations();
        if (!mounted) return;

        if (orgs.length === 1 && !autoSkipStarted.current) {
          autoSkipStarted.current = true;
          setAutoSkipping(true);
          confirmOrganization(orgs[0]!);
          return;
        }

        setOrganizations(orgs);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiHttpError && err.status === 403) {
          setError(emptyMessage);
        } else {
          setError(loadError);
        }
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [confirmOrganization]);

  async function handleLogout() {
    await logout();
    router.refresh();
    router.push('/login');
  }

  function handleSelect(org: Organization) {
    setSelectingId(org.id);
    confirmOrganization(org);
  }

  if (loading || autoSkipping) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-12 text-center"
        aria-busy="true"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-atg-border border-t-primary" />
        <p className="text-lg text-atg-muted">
          {autoSkipping ? autoSkipLabel : loadingLabel}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <p role="alert" className="text-base text-red-600 dark:text-red-400">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          className="min-h-[3.5rem] text-lg"
          onClick={() => void handleLogout()}
        >
          {logoutLabel}
        </Button>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-semibold text-atg-fg">{emptyTitle}</h2>
        <p className="text-base text-atg-muted">{emptyMessage}</p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          className="min-h-[3.5rem] text-lg"
          onClick={() => void handleLogout()}
        >
          {logoutLabel}
        </Button>
      </div>
    );
  }

  return (
    <ul className="pos-touch grid gap-4 sm:grid-cols-2">
      {organizations.map((org) => {
        const subtitle = organizationSubtitle(org);
        const isSelecting = selectingId === org.id;

        return (
          <li key={org.id}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              loading={isSelecting}
              className="!h-auto min-h-[4.5rem] px-5 py-4"
              onClick={() => handleSelect(org)}
            >
              <span className="flex w-full flex-col items-start gap-1 text-left">
                <span className="text-lg font-semibold">{org.name}</span>
                {subtitle ? (
                  <span className="text-sm font-normal text-atg-muted">{subtitle}</span>
                ) : null}
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
