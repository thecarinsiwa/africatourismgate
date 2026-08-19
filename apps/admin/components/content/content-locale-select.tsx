'use client';

import { Select, type SelectOption } from '@africatourismgate/ui';

type ContentLocaleSelectProps = {
  id?: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (locale: string) => void;
};

export function ContentLocaleSelect({
  id,
  label,
  value,
  options,
  onChange,
}: ContentLocaleSelectProps) {
  return (
    <Select
      id={id}
      name="locale"
      label={label}
      value={value}
      options={options}
      onChange={(event) => onChange(event.target.value)}
      wrapperClassName="max-w-xs"
    />
  );
}
