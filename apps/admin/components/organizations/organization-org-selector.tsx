'use client';

import { SearchableSelect } from '@africatourismgate/ui';
import type { Organization } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useId, useMemo } from 'react';

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
  label: labelProp,
  className,
  disabled = false,
}: OrganizationOrgSelectorProps) {
  const t = useTranslations('modules.organizations.selector');
  const tSelect = useTranslations('modules.common.select');
  const generatedId = useId();
  const selectId = idProp ?? generatedId;
  const label = labelProp ?? t('defaultLabel');

  const options = useMemo(
    () =>
      organizations.map((org) => ({
        value: org.id,
        label: org.name,
      })),
    [organizations],
  );

  if (organizations.length === 0) {
    return null;
  }

  return (
    <SearchableSelect
      id={selectId}
      className={className}
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      searchPlaceholder={tSelect('searchPlaceholder')}
      emptyMessage={tSelect('empty')}
    />
  );
}
