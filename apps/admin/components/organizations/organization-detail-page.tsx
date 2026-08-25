'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Organization, OrganizationListItem } from '@africatourismgate/types';
import {
  Card,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextLink,
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
  useFormatDateTime,
  useOrganizationLegalFormOptions,
} from '../../lib/i18n/use-module-labels';
import {
  formatOrganizationLegalForm,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { OrganizationForm } from './organization-form';
import { OrganizationLogoField } from './organization-logo-field';

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
  const formatDateTime = useFormatDateTime();
  const { hasPermission, isSuperAdmin, loading: permissionsLoading } = usePermissions();
  const canReadSettings =
    !permissionsLoading && (isSuperAdmin || hasPermission('organization_settings.read'));
  const canWriteSettings =
    !permissionsLoading && (isSuperAdmin || hasPermission('organization_settings.write'));
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
        suppressDescription
      >
        <div className="min-w-0 space-y-6">
          <Skeleton className="h-28 w-full max-w-3xl" />
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
        suppressDescription
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
  const emptyDash = tCommon('empty.dash');
  const websiteHref = organization.website?.trim();

  return (
    <AdminIntroPage
      routePath="organisations/id"
      backHref={ORGANISATIONS_HUB_HREF}
      backLabelKey="backLabel"
      suppressDescription
    >
      <div className="min-w-0 space-y-6">
        <Card variant="dashboard" padding="md" className="overflow-hidden">
          <div className="flex flex-wrap items-start gap-4">
            <OrganizationLogoField
              organizationId={organizationId}
              name={organization.name}
              organizationLogoUrl={organization.logoUrl}
              canWrite={canWriteSettings}
              isSuperAdmin={isSuperAdmin}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
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

              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {t('meta.currency')}
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-atg-fg">
                    {organization.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {t('meta.contact')}
                  </dt>
                  <dd className="mt-0.5 text-atg-fg">
                    {organization.contactEmail?.trim() || emptyDash}
                    {organization.contactPhone?.trim() ? (
                      <span className="mt-0.5 block text-atg-muted">
                        {organization.contactPhone.trim()}
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {t('meta.website')}
                  </dt>
                  <dd className="mt-0.5">
                    {websiteHref ? (
                      <TextLink
                        href={websiteHref}
                        variant="primary"
                        className="break-all font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {websiteHref.replace(/^https?:\/\//i, '')}
                      </TextLink>
                    ) : (
                      <span className="text-atg-fg">{emptyDash}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                    {t('meta.createdAt')}
                  </dt>
                  <dd className="mt-0.5 tabular-nums text-atg-fg">
                    {formatDateTime(organization.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList aria-label={t('tabsAria')} className="h-auto flex-wrap">
            <TabsTrigger value="infos">{t('tabs.infos')}</TabsTrigger>
            <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
            {showSettingsTab ? (
              <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="infos" className="pt-2">
            <OrganizationForm
              mode="edit"
              organizationId={organizationId}
              initialOrganization={organization}
              onUpdated={(updated) => setState({ status: 'ready', organization: updated })}
            />
          </TabsContent>

          <TabsContent value="users" className="pt-2">
            <EmployeesList lockedOrganizationId={organizationId} embedded />
          </TabsContent>

          {showSettingsTab ? (
            <TabsContent value="settings" className="pt-2">
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
