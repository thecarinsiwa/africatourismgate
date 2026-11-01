'use client';

import { SearchableSelect } from '@africatourismgate/ui';
import type { Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 50;

type DestinationSelectProps = {
  value: string;
  onChange: (destinationId: string) => void;
  label: string;
  id?: string;
  name?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Exclude this destination id from the options (e.g. opposite endpoint). */
  excludeId?: string;
};

function toOption(destination: Destination) {
  return {
    value: destination.id,
    label: `${destination.name} (${destination.countryCode})`,
  };
}

export function DestinationSelect({
  value,
  onChange,
  label,
  id: idProp,
  name,
  hint,
  error,
  required,
  disabled = false,
  className,
  excludeId,
}: DestinationSelectProps) {
  const tSelect = useTranslations('modules.common.select');
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getApiClient()
      .listDestinations({
        page: 1,
        limit: PAGE_SIZE,
        search: search || undefined,
      })
      .then((result) => {
        if (!cancelled) setDestinations(result.data);
      })
      .catch(() => {
        if (!cancelled) setDestinations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search]);

  useEffect(() => {
    if (!value) {
      setSelectedDestination(null);
      return;
    }
    const inList = destinations.find((d) => d.id === value);
    if (inList) {
      setSelectedDestination(inList);
      return;
    }
    if (selectedDestination?.id === value) return;

    let cancelled = false;
    void getApiClient()
      .getDestination(value)
      .then((destination) => {
        if (!cancelled) setSelectedDestination(destination);
      })
      .catch(() => {
        if (!cancelled) setSelectedDestination(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, destinations, selectedDestination?.id]);

  const options = useMemo(() => {
    const byId = new Map<string, Destination>();
    for (const destination of destinations) {
      if (excludeId && destination.id === excludeId && destination.id !== value) {
        continue;
      }
      byId.set(destination.id, destination);
    }
    if (
      selectedDestination &&
      selectedDestination.id === value &&
      !(excludeId && selectedDestination.id === excludeId && selectedDestination.id !== value)
    ) {
      byId.set(selectedDestination.id, selectedDestination);
    }
    return Array.from(byId.values()).map(toOption);
  }, [destinations, excludeId, selectedDestination, value]);

  return (
    <SearchableSelect
      id={id}
      name={name}
      className={className}
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      searchPlaceholder={tSelect('searchPlaceholder')}
      emptyMessage={tSelect('empty')}
      placeholder={tSelect('chooseDash')}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      filterLocally={false}
      onSearchChange={setSearchInput}
      loading={loading}
      loadingMessage={tSelect('loading')}
    />
  );
}
