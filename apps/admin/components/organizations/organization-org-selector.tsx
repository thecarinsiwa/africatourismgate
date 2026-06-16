'use client';

import { cn } from '@africatourismgate/ui';
import type { Organization } from '@africatourismgate/types';
import { useId } from 'react';

export const organizationOrgSelectClassName =
  'w-full rounded-lg border border-atg-border bg-atg-bg px-3 py-2 text-sm text-atg-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

type OrganizationOrgSelectorProps = {
  organizations: Pick<Organization, 'id' | 'name'>[];
  value: string;
  onChange: (organizationId: string) => void;
  id?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
};

export function OrganizationOrgSelector({
  organizations,
  value,
  onChange,
  id: idProp,
  label = 'Organisation',
  className,
  disabled = false,
}: OrganizationOrgSelectorProps) {
  const generatedId = useId();
  const selectId = idProp ?? generatedId;

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-atg-fg">
        {label}
      </label>
      <select
        id={selectId}
        className={cn(organizationOrgSelectClassName, disabled && 'cursor-not-allowed opacity-60')}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
