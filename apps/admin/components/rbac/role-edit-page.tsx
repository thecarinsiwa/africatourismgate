'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import type { Role } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAdminEditPageMeta } from '../use-admin-edit-page-meta';
import { getApiClient } from '../../lib/auth/api';
import { RoleForm } from './role-form';

type RoleEditPageProps = {
  roleId: string;
};

export function RoleEditPage({ roleId }: RoleEditPageProps) {
  const { rbac: getRbacErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.rbac.roles');
  const tCommon = useTranslations('modules.common');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; role: Role }
  >({ status: 'loading' });

  useAdminEditPageMeta({
    ready: state.status === 'ready',
    title:
      state.status === 'ready' && state.role.isSystem
        ? t('editTitle.system')
        : t('editTitle.custom'),
    entityLabel: state.status === 'ready' ? state.role.name : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const role = await getApiClient().getRole(roleId);
        if (!cancelled) setState({ status: 'ready', role });
      } catch (error) {
        if (!cancelled) setState({ status: 'error', message: getRbacErrorMessage(error) });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [roleId, getRbacErrorMessage]);

  if (state.status === 'loading') {
    return <p className="text-sm text-atg-muted">{tCommon('loading')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
        <Link href="/systeme/roles" className="text-sm text-primary">
          {t('backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <RoleForm mode="edit" roleId={roleId} initialRole={state.role} />
    </div>
  );
}
