'use client';

import { DataTableBadge } from '@africatourismgate/ui';
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
  const label = name ?? code;

  return (
    <DataTableBadge variant={getRoleBadgeVariant(code)} className={className}>
      {showCode && name ? (
        <span>
          {name}
          <span className="ml-1 font-normal opacity-80">({code})</span>
        </span>
      ) : (
        label
      )}
    </DataTableBadge>
  );
}
