'use client';

import { SearchableSelect } from '@africatourismgate/ui';
import { getIsoCountrySelectOptions } from '@africatourismgate/utils';
import { useMemo } from 'react';

type NationalitySelectProps = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (countryCode: string) => void;
  locale: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
};

export function NationalitySelect({
  id,
  name,
  label,
  value,
  onChange,
  locale,
  required,
  disabled,
  error,
  placeholder = '—',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results.',
  className,
}: NationalitySelectProps) {
  const options = useMemo(() => getIsoCountrySelectOptions(locale), [locale]);

  return (
    <SearchableSelect
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      required={required}
      disabled={disabled}
      error={error}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      className={className}
    />
  );
}
