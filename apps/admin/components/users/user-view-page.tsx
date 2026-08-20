'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAccountStatusLabels } from '../../lib/i18n/use-module-labels';

import type { Organization, User, UserStatus } from '@africatourismgate/types';
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

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="text-sm text-atg-fg">{value}</dd>
    </div>
  );
}

export function UserViewPage({ userId }: UserViewPageProps) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.users.detail');
  const tForm = useTranslations('modules.users.form');
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
    | { status: 'ready'; user: User; organization: Organization | null }
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
        let organization: OrganizationListItem | null = null;
        if (user.organizationId) {
          try {
            organization = await client.getOrganization(user.organizationId);
          } catch {
            organization = null;
          }
        }
        if (!cancelled) {
          setState({ status: 'ready', user, organization });
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
      return date.toLocaleString(locale);
    },
    [emptyDash, locale],
  );

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
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

  const { user, organization } = state;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <AdminPageBackLink
        href="/utilisateurs"
        label={tPages('backLabel')}
        className="block"
      />

      <Card
        variant="dashboard"
        className="flex flex-col gap-4 border border-atg-border/80 bg-atg-elevated/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <Avatar
            email={user.email}
            firstName={user.firstName}
            lastName={user.lastName}
            size="lg"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-atg-fg">
                {fullName || user.email}
              </h2>
              <DataTableBadge variant={statusVariants[user.status]}>
                {statusLabels[user.status]}
              </DataTableBadge>
            </div>
            <p className="mt-1 text-sm text-atg-muted">{user.email}</p>
          </div>
        </div>
        <Button href={`/utilisateurs/${userId}`} className="w-full sm:w-auto">
          {tDetail('editButton')}
        </Button>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={tDetail('tabsAria')}>
          <TabsTrigger value="profil">{tDetail('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="adresses">{tDetail('tabs.addresses')}</TabsTrigger>
          <TabsTrigger value="paiement">{tDetail('tabs.paymentMethods')}</TabsTrigger>
          <TabsTrigger value="sessions">{tDetail('tabs.sessions')}</TabsTrigger>
          <TabsTrigger value="roles">{tDetail('tabs.roles')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <Card variant="dashboard" padding="lg">
            <dl className="grid gap-5 sm:grid-cols-2">
              <ProfileField label={tForm('email')} value={user.email} />
              <ProfileField
                label={tForm('status')}
                value={statusLabels[user.status]}
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
                  organization?.name ??
                  (user.organizationId ? user.organizationId.slice(0, 8) : emptyDash)
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

        <TabsContent value="adresses">
          <UserAddressesList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="paiement">
          <UserPaymentMethodsList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="sessions">
          <UserSessionsList
            fixedUserId={userId}
            showUserColumn={false}
            layout="cards"
            readOnly
          />
        </TabsContent>

        <TabsContent value="roles">
          <UserRoleAssignmentsPanel userId={userId} readOnly />
        </TabsContent>
      </Tabs>
    </div>
  );
}
