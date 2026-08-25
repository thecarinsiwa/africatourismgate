'use client';

import { DataTableBadge } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { getRoleBadgeVariant } from '../../lib/rbac-display';

type RoleBadgeProps = {
  code: string;
  name?: string;
  showCode?: boolean;
  className?: string;
};

export function RoleBadge({
  code,
  name,
  showCode = false,
  className,
}: RoleBadgeProps) {
  const tRoleNames = useTranslations('modules.rbac.roleNames');
  const hasTranslatedName =
    typeof tRoleNames.has === 'function' ? tRoleNames.has(code) : false;
  const displayName = hasTranslatedName ? tRoleNames(code) : (name ?? code);

  return (
    <DataTableBadge variant={getRoleBadgeVariant(code)} className={className}>
      {showCode && displayName !== code ? (
        <span>
          {displayName}
          <span className="ml-1 font-normal opacity-80">({code})</span>
        </span>
      ) : (
        displayName
      )}
    </DataTableBadge>
  );
}
