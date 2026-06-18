'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  buildPackagesSearchQuery,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import { useTranslations } from '../../lib/i18n/locale-provider';
import {
  SearchFormInput,
  SearchFormLabel,
  SearchFormPanel,
  SearchFormSubmit,
} from '../shared';

type PackagesSearchFormProps = {
  initialValues: PackagesSearchParams;
};

export function PackagesSearchForm({ initialValues }: PackagesSearchFormProps) {
  const router = useRouter();
  const t = useTranslations();
  const p = t.packages;

  const [searchInput, setSearchInput] = useState(initialValues.search ?? '');

  useEffect(() => {
    setSearchInput(initialValues.search ?? '');
  }, [initialValues.search]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      `/packages${buildPackagesSearchQuery({
        ...initialValues,
        search: searchInput.trim() || undefined,
        page: undefined,
      })}`,
    );
  }

  return (
    <SearchFormPanel id="packages-search" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <SearchFormLabel>{p.searchLabel}</SearchFormLabel>
          <SearchFormInput
            type="search"
            name="search"
            placeholder={p.searchPlaceholder}
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>
        <div className="flex items-end">
          <SearchFormSubmit label={p.searchSubmit} />
        </div>
      </div>
    </SearchFormPanel>
  );
}
