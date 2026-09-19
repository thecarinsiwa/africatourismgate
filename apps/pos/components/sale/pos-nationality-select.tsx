'use client';

import { SearchableSelect } from '@africatourismgate/ui';
import { getIsoCountrySelectOptions } from '@africatourismgate/utils';
import { useMemo } from 'react';

type PosNationalitySelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

/** POS is French-first; country labels use fr DisplayNames. */
export function PosNationalitySelect({
  id,
  label,
  value,
  onChange,
  required,
  placeholder = 'Choisir un pays',
  searchPlaceholder = 'Rechercher un pays…',
  emptyMessage = 'Aucun pays trouvé.',
}: PosNationalitySelectProps) {
  const options = useMemo(() => getIsoCountrySelectOptions('fr'), []);

  return (
    <SearchableSelect
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  );
}
