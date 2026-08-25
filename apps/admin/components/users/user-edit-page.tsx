'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useAccountStatusLabels } from '../../lib/i18n/use-module-labels';

import type { User, UserStatus } from '@africatourismgate/types';
import {
  Avatar,
  Button,
  DataTableBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@africatourismgate/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageBackLink } from '../admin-page-back-link';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { UserRoleAssignmentsPanel } from '../rbac/user-role-assignments-panel';
import { UserAddressesList } from './user-addresses-list';
import { UserForm } from './user-form';
import { UserPaymentMethodsList } from './user-payment-methods-list';
import { UserSessionsList } from './user-sessions-list';

type UserEditPageProps = {
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

export function UserEditPage({ userId }: UserEditPageProps) {
  const { users: getUsersErrorMessage } = useAdminErrorMessages();
  const tDetail = useTranslations('modules.users.detail');
  const tPages = useTranslations('pages.utilisateurs.id');
  const tActions = useTranslations('common.actions');
  const statusLabels = useAccountStatusLabels();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'profil';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; user: User }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title: tDetail('title'),
    entityLabel: state.status === 'ready' ? state.user.email : undefined,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await getApiClient().getUser(userId);
        if (!cancelled) {
          setState({ status: 'ready', user });
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

  if (state.status === 'loading') {
    return (
      <div className="space-y-6">
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

  const { user } = state;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <div className="space-y-6">
      <AdminPageBackLink
        href="/utilisateurs"
        label={tPages('backLabel')}
        className="block"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Avatar
          email={user.email}
          firstName={user.firstName}
          lastName={user.lastName}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-atg-fg">{fullName || user.email}</h2>
            <DataTableBadge variant={statusVariants[user.status]}>
              {statusLabels[user.status]}
            </DataTableBadge>
          </div>
          <p className="mt-1 text-sm text-atg-muted">{user.email}</p>
        </div>
        <Button href={`/utilisateurs/${userId}/voir`} variant="outline" className="w-full sm:w-auto">
          {tDetail('viewButton')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={tDetail('tabsAria')}>
          <TabsTrigger value="profil">{tDetail('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="adresses">{tDetail('tabs.addresses')}</TabsTrigger>
          <TabsTrigger value="paiement">{tDetail('tabs.paymentMethods')}</TabsTrigger>
          <TabsTrigger value="sessions">{tDetail('tabs.sessions')}</TabsTrigger>
          <TabsTrigger value="roles">{tDetail('tabs.roles')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          <UserForm mode="edit" userId={userId} initialUser={user} />
        </TabsContent>

        <TabsContent value="adresses">
          <UserAddressesList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="paiement">
          <UserPaymentMethodsList fixedUserId={userId} showUserColumn={false} />
        </TabsContent>

        <TabsContent value="sessions">
          <UserSessionsList fixedUserId={userId} showUserColumn={false} layout="cards" />
        </TabsContent>

        <TabsContent value="roles">
          <UserRoleAssignmentsPanel userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
