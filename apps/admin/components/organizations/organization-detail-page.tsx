'use client';

import type { Organization, OrganizationListItem } from '@africatourismgate/types';
import {
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EmployeesList } from '../employees/employees-list';
import {
  OrganizationSettingsForm,
} from '../parametres/organization-settings-form';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import {
  formatOrganizationLegalForm,
  organizationStatusLabels,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { getOrganizationsErrorMessage } from '../../lib/organizations-errors';
import { OrganizationForm } from './organization-form';
import { OrganizationLogo } from './organization-logo';

type OrganizationDetailPageProps = {
  organizationId: string;
};

const TAB_VALUES = ['infos', 'users', 'settings'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function OrganizationDetailPage({ organizationId }: OrganizationDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'infos';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; organization: Organization }
  >({ status: 'loading' });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canReadSettings, setCanReadSettings] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: 'Organisation',
    entityLabel: state.status === 'ready' ? state.organization.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOrganization() {
      try {
        const organization = await getApiClient().getOrganization(organizationId);
        if (!cancelled) {
          setState({ status: 'ready', organization });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
        }
      }
    }

    void loadOrganization();
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccess() {
      try {
        const client = getApiClient();
        const me = await client.getAuthMe();
        const superAdmin = me.isSuperAdmin;
        const settingsRead =
          superAdmin || me.permissions.includes('organization_settings.read');

        if (!cancelled) {
          setIsSuperAdmin(superAdmin);
          setCanReadSettings(settingsRead);
        }

        if (superAdmin) {
          const orgs = await client.listOrganizations({ page: 1, limit: 100 });
          if (!cancelled) {
            setOrganizations(orgs.data);
          }
        }
      } catch {
        if (!cancelled) {
          setIsSuperAdmin(false);
          setCanReadSettings(false);
          setOrganizations([]);
        }
      }
    }

    void loadAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'infos') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleSettingsOrganizationChange = useCallback(
    (id: string) => {
      router.replace(`/organisations/${id}?tab=settings`);
    },
    [router],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/organisations"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { organization } = state;
  const legalFormLabel = formatOrganizationLegalForm(organization.legalForm);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <OrganizationLogo
          name={organization.name}
          logoUrl={organization.logoUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-atg-fg">{organization.name}</h2>
            <DataTableBadge variant={organizationStatusVariants[organization.status]}>
              {organizationStatusLabels[organization.status]}
            </DataTableBadge>
            {organization.legalForm ? (
              <DataTableBadge variant="muted">{legalFormLabel}</DataTableBadge>
            ) : null}
          </div>
          <p className="mt-1 font-mono text-sm text-atg-muted">{organization.slug}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label="Sections de l'organisation">
          <TabsTrigger value="infos">Infos</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          {canReadSettings ? <TabsTrigger value="settings">Paramètres</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="infos">
          <OrganizationForm
            mode="edit"
            organizationId={organizationId}
            initialOrganization={organization}
            onUpdated={(updated) => setState({ status: 'ready', organization: updated })}
          />
        </TabsContent>

        <TabsContent value="users">
          <EmployeesList lockedOrganizationId={organizationId} embedded />
        </TabsContent>

        {canReadSettings ? (
          <TabsContent value="settings">
            <p className="mb-6 text-sm text-atg-muted">
              Configuration de l’organisation : coordonnées, locale, réservation et branding.
            </p>
            <OrganizationSettingsForm
              organizationId={organizationId}
              isSuperAdmin={isSuperAdmin}
              organizations={organizations}
              onOrganizationIdChange={
                isSuperAdmin ? handleSettingsOrganizationChange : undefined
              }
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
