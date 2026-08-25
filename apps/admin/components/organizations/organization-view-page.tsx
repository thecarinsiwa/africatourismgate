'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Organization } from '@africatourismgate/types';
import {
  Button,
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
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { EmployeesList } from '../employees/employees-list';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { AdminIntroPage } from '../pages/admin-intro-page';
import { getApiClient } from '../../lib/auth/api';
import {
  useAccountStatusLabels,
  useFormatDateTime,
  useOrganizationLegalFormOptions,
} from '../../lib/i18n/use-module-labels';
import {
  formatOrganizationLegalForm,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { OrganizationLogoField } from './organization-logo-field';

const ORGANISATIONS_HUB_HREF = '/organisations';

type OrganizationViewPageProps = {
  organizationId: string;
};

const TAB_VALUES = ['infos', 'users'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function ProfileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-atg-fg">{title}</h3>
      <dl className="mt-1 divide-y divide-atg-border/60">{children}</dl>
    </div>
  );
}

export function OrganizationViewPage({ organizationId }: OrganizationViewPageProps) {
  const { organizations: getOrganizationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.organizations.detail');
  const tForm = useTranslations('modules.organizations.form');
  const tCommon = useTranslations('modules.common');
  const accountStatusLabels = useAccountStatusLabels();
  const legalFormOptions = useOrganizationLegalFormOptions();
  const formatDateTime = useFormatDateTime();
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

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: t('viewTitle'),
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

  if (state.status === 'loading') {
    return (
      <AdminIntroPage
        routePath="organisations/id/voir"
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
        routePath="organisations/id/voir"
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
  const legalFormLabel = formatOrganizationLegalForm(
    organization.legalForm,
    legalFormOptions,
    tCommon('empty.dash'),
  );
  const emptyDash = tCommon('empty.dash');
  const websiteHref = organization.website?.trim();
  const displayOrDash = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    return trimmed || emptyDash;
  };

  return (
    <AdminIntroPage
      routePath="organisations/id/voir"
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
              canWrite={false}
              isSuperAdmin={false}
            />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                <Button href={`/organisations/${organizationId}`} className="shrink-0 self-start">
                  {t('editButton')}
                </Button>
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
                    {displayOrDash(organization.contactEmail)}
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
          </TabsList>

          <TabsContent value="infos" className="pt-2">
            <Card variant="dashboard" padding="md" className="max-w-4xl space-y-8">
              <ProfileSection title={tForm('sections.identity')}>
                <ProfileField label={tForm('name')} value={organization.name} />
                <ProfileField
                  label={tForm('slug')}
                  value={<span className="font-mono text-sm">{organization.slug}</span>}
                />
                <ProfileField
                  label={tForm('description')}
                  value={
                    organization.description?.trim() ? (
                      <span className="whitespace-pre-wrap font-normal">
                        {organization.description.trim()}
                      </span>
                    ) : (
                      emptyDash
                    )
                  }
                />
              </ProfileSection>

              <ProfileSection title={tForm('sections.contact')}>
                <ProfileField
                  label={tForm('website')}
                  value={
                    websiteHref ? (
                      <TextLink
                        href={websiteHref}
                        variant="primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {websiteHref}
                      </TextLink>
                    ) : (
                      emptyDash
                    )
                  }
                />
                <ProfileField
                  label={tForm('contactEmail')}
                  value={displayOrDash(organization.contactEmail)}
                />
                <ProfileField
                  label={tForm('contactPhone')}
                  value={displayOrDash(organization.contactPhone)}
                />
              </ProfileSection>

              <ProfileSection title={tForm('sections.legal')}>
                <ProfileField label={tForm('legalForm')} value={legalFormLabel} />
                <ProfileField label={tForm('rccm')} value={displayOrDash(organization.rccm)} />
                <ProfileField label={tForm('idNat')} value={displayOrDash(organization.idNat)} />
                <ProfileField label={tForm('nif')} value={displayOrDash(organization.nif)} />
                <ProfileField label={tForm('cnss')} value={displayOrDash(organization.cnss)} />
              </ProfileSection>

              <ProfileSection title={tForm('sections.configuration')}>
                <ProfileField label={tForm('currency')} value={organization.currency} />
                <ProfileField
                  label={tForm('status')}
                  value={
                    <DataTableBadge variant={organizationStatusVariants[organization.status]}>
                      {accountStatusLabels[organization.status]}
                    </DataTableBadge>
                  }
                />
              </ProfileSection>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="pt-2">
            <EmployeesList lockedOrganizationId={organizationId} embedded />
          </TabsContent>
        </Tabs>
      </div>
    </AdminIntroPage>
  );
}
