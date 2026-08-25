'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAccountStatusLabels } from '../../lib/i18n/use-module-labels';

import type {
  Organization,
  User,
  UserRoleAssignment,
  UserStatus,
} from '@africatourismgate/types';
import {
  Avatar,
  Button,
  Card,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { RoleBadge } from '../rbac/role-badge';
import { UserRoleAssignmentsPanel } from '../rbac/user-role-assignments-panel';
import { UserAddressesList } from './user-addresses-list';
import { UserPaymentMethodsList } from './user-payment-methods-list';
import { UserSessionsList } from './user-sessions-list';

type UserViewPageProps = {
  userId: string;
};

const TAB_VALUES = ['profil', 'adresses', 'paiement', 'sessions', 'roles'] as const;
type TabValue = (typeof TAB_VALUES)[number];

const statusVariants: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  deleted: 'danger',
};

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 text-sm font-medium text-atg-fg break-words">{value}</dd>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-atg-fg">{value}</p>
    </div>
  );
}

export function UserViewPage({ userId }: UserViewPageProps) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.users.detail');
  const tForm = useTranslations('modules.users.form');
  const tRoles = useTranslations('modules.users.roles');
  const tPages = useTranslations('pages.utilisateurs.id');
  const tActions = useTranslations('common.actions');
  const tEmpty = useTranslations('modules.common.empty');
  const statusLabels = useAccountStatusLabels();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'profil';
  const emptyDash = tEmpty('dash');

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        user: User;
        organization: Organization | null;
        roles: UserRoleAssignment[];
      }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('viewTitle'),
    entityLabel: state.status === 'ready' ? state.user.email : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const client = getApiClient();
        const user = await client.getUser(userId);
        const organization = user.organizationId
          ? await client.getOrganization(user.organizationId).catch(() => null)
          : null;

        let roles: UserRoleAssignment[] = [];
        try {
          const rolesResult = await client.listUserRoleAssignments({
            userId,
            page: 1,
            limit: 20,
            includeRevoked: false,
          });
          roles = rolesResult.data;
        } catch {
          roles = [];
        }

        if (!cancelled) {
          setState({
            status: 'ready',
            user,
            organization,
            roles,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: 'error', message: getUsersErrorMessage(error) });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, getUsersErrorMessage]);

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'profil') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const formatDateTime = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return emptyDash;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    [emptyDash, locale],
  );

  const formatDate = useCallback(
    (iso: string | null | undefined) => {
      if (!iso) return emptyDash;
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return date.toLocaleDateString(locale, { dateStyle: 'medium' });
    },
    [emptyDash, locale],
  );

  if (state.status === 'loading') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <AdminPageBackLink href="/utilisateurs" label={tPages('backLabel')} />
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
        <Link
          href="/utilisateurs"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          ← {tActions('back')}
        </Link>
      </div>
    );
  }

  const { user, organization, roles } = state;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const organizationLabel =
    organization?.name ??
    (user.organizationId ? user.organizationId.slice(0, 8) : emptyDash);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <AdminPageBackLink
        href="/utilisateurs"
        label={tPages('backLabel')}
        className="block"
      />

      <section className="overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-sm">
        <div className="border-b border-atg-border bg-gradient-to-br from-atg-surface via-atg-elevated to-atg-surface px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <Avatar
              email={user.email}
              firstName={user.firstName}
              lastName={user.lastName}
              size="lg"
              className="shrink-0 ring-2 ring-atg-border/60 ring-offset-2 ring-offset-atg-elevated"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-atg-fg sm:text-2xl">
                      {fullName || user.email}
                    </h2>
                    <DataTableBadge variant={statusVariants[user.status]}>
                      {statusLabels[user.status]}
                    </DataTableBadge>
                  </div>
                  <p className="truncate text-sm text-atg-muted">{user.email}</p>
                  {roles.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {roles.map((assignment) =>
                        assignment.role ? (
                          <RoleBadge
                            key={assignment.id}
                            code={assignment.role.code}
                            name={assignment.role.name}
                          />
                        ) : (
                          <RoleBadge
                            key={assignment.id}
                            code={assignment.roleId.slice(0, 8)}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="pt-1 text-xs text-atg-muted">{tRoles('empty')}</p>
                  )}
                </div>

                <Button
                  href={`/utilisateurs/${userId}`}
                  className="shrink-0 self-stretch sm:self-start"
                >
                  {tDetail('editButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-atg-border/80 bg-atg-surface/40 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <MetaItem label={tForm('organization')} value={organizationLabel} />
          <MetaItem
            label={tForm('phone')}
            value={user.phone?.trim() || emptyDash}
          />
          <MetaItem
            label={tForm('preferredLanguage')}
            value={user.preferredLanguage?.trim()?.toUpperCase() || emptyDash}
          />
          <MetaItem label={tDetail('createdAt')} value={formatDate(user.createdAt)} />
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-atg-border bg-atg-elevated p-1.5">
          <TabsList aria-label={tDetail('tabsAria')} className="w-full justify-start">
            <TabsTrigger value="profil">{tDetail('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="adresses">{tDetail('tabs.addresses')}</TabsTrigger>
            <TabsTrigger value="paiement">{tDetail('tabs.paymentMethods')}</TabsTrigger>
            <TabsTrigger value="sessions">{tDetail('tabs.sessions')}</TabsTrigger>
            <TabsTrigger value="roles">{tDetail('tabs.roles')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profil" className="outline-none">
          <Card variant="dashboard" padding="lg" className="border border-atg-border/80">
            <h3 className="mb-1 text-base font-semibold text-atg-fg">
              {tDetail('tabs.profile')}
            </h3>
            <p className="mb-4 text-sm text-atg-muted">{tDetail('profileIntro')}</p>
            <dl className="divide-y divide-atg-border">
              <ProfileField label={tForm('email')} value={user.email} />
              <ProfileField
                label={tForm('status')}
                value={
                  <DataTableBadge variant={statusVariants[user.status]}>
                    {statusLabels[user.status]}
                  </DataTableBadge>
                }
              />
              <ProfileField
                label={tForm('firstName')}
                value={user.firstName || emptyDash}
              />
              <ProfileField
                label={tForm('lastName')}
                value={user.lastName || emptyDash}
              />
              <ProfileField
                label={tForm('phone')}
                value={user.phone?.trim() || emptyDash}
              />
              <ProfileField
                label={tForm('preferredLanguage')}
                value={user.preferredLanguage?.trim() || emptyDash}
              />
              <ProfileField
                label={tForm('organization')}
                value={
                  organization ? (
                    <Link
                      href={`/organisations/${organization.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {organization.name}
                    </Link>
                  ) : (
                    organizationLabel
                  )
                }
              />
              <ProfileField
                label={tDetail('createdAt')}
                value={formatDateTime(user.createdAt)}
              />
              <ProfileField
                label={tDetail('updatedAt')}
                value={formatDateTime(user.updatedAt)}
              />
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="adresses" className="outline-none">
          <UserAddressesList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="paiement" className="outline-none">
          <UserPaymentMethodsList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="sessions" className="outline-none">
          <UserSessionsList
            fixedUserId={userId}
            showUserColumn={false}
            layout="cards"
            readOnly
          />
        </TabsContent>

        <TabsContent value="roles" className="outline-none">
          <UserRoleAssignmentsPanel userId={userId} readOnly />
        </TabsContent>
      </Tabs>
    </div>
  );
}
