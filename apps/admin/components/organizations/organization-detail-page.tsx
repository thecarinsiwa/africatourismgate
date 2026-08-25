'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Organization, OrganizationListItem } from '@africatourismgate/types';
import {
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EmployeesList } from '../employees/employees-list';
import { OrganizationSettingsForm } from '../parametres/organization-settings-form';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import {
  useAccountStatusLabels,
  useOrganizationLegalFormOptions,
} from '../../lib/i18n/use-module-labels';
import {
  formatOrganizationLegalForm,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { OrganizationForm } from './organization-form';
import { OrganizationLogo } from './organization-logo';

const ORGANISATIONS_HUB_HREF = '/organisations';

type OrganizationDetailPageProps = {
  organizationId: string;
};

const TAB_VALUES = ['infos', 'users', 'settings'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

export function OrganizationDetailPage({ organizationId }: OrganizationDetailPageProps) {
  const { organizations: getOrganizationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.organizations.detail');
  const tCommon = useTranslations('modules.common');
  const accountStatusLabels = useAccountStatusLabels();
  const legalFormOptions = useOrganizationLegalFormOptions();
  const { hasPermission, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const canReadSettings =
    !permissionsLoading && (isSuperAdmin || hasPermission('organization_settings.read'));
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
  const [organizations, setOrganizations] = useState<OrganizationListItem[]>([]);

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('title'),
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
  }, [organizationId, getOrganizationsErrorMessage]);

  useEffect(() => {
    if (permissionsLoading || !isSuperAdmin) {
      setOrganizations([]);
      return;
    }

    let cancelled = false;
    void getApiClient()
      .listOrganizations({ page: 1, limit: 100 })
      .then((orgs) => {
        if (!cancelled) setOrganizations(orgs.data);
      })
      .catch(() => {
        if (!cancelled) setOrganizations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, permissionsLoading]);

  useEffect(() => {
    if (permissionsLoading) return;
    if (activeTab === 'settings' && !canReadSettings) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('tab');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [
    activeTab,
    canReadSettings,
    pathname,
    permissionsLoading,
    router,
    searchParams,
  ]);

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
      <AdminIntroPage
        routePath="organisations/id"
        backHref={ORGANISATIONS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <div className="min-w-0 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
          <p className="sr-only">{tCommon('loading')}</p>
        </div>
      </AdminIntroPage>
    );
  }

  if (state.status === 'error') {
    return (
      <AdminIntroPage
        routePath="organisations/id"
        backHref={ORGANISATIONS_HUB_HREF}
        backLabelKey="backLabel"
      >
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      </AdminIntroPage>
    );
  }

  const { organization } = state;
  const legalFormLabel = formatOrganizationLegalForm(organization.legalForm, legalFormOptions);
  const showSettingsTab = canReadSettings;

  return (
    <AdminIntroPage
      routePath="organisations/id"
      backHref={ORGANISATIONS_HUB_HREF}
      backLabelKey="backLabel"
    >
      <div className="min-w-0 space-y-6">
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
                {accountStatusLabels[organization.status]}
              </DataTableBadge>
              {organization.legalForm ? (
                <DataTableBadge variant="muted">{legalFormLabel}</DataTableBadge>
              ) : null}
            </div>
            <p className="mt-1 font-mono text-sm text-atg-muted">{organization.slug}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList aria-label={t('tabsAria')}>
            <TabsTrigger value="infos">{t('tabs.infos')}</TabsTrigger>
            <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
            {showSettingsTab ? (
              <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
            ) : null}
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

          {showSettingsTab ? (
            <TabsContent value="settings">
              <p className="mb-6 text-sm text-atg-muted">{t('settingsIntro')}</p>
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
    </AdminIntroPage>
  );
}
