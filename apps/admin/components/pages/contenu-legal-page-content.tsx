'use client';

import { useCallback, useRef, useState } from 'react';
import type { LegalListFilter } from '../../config/legal-kpi';
import { LegalPagesList } from '../legal/legal-pages-list';
import { LegalStatCards } from '../legal/legal-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuLegalPageContent() {
  const [listFilter, setListFilter] = useState<LegalListFilter>({});
  const [statsKey, setStatsKey] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleListFilterChange = useCallback((filter: LegalListFilter) => {
    setListFilter(filter);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleChanged = useCallback(() => {
    setStatsKey((value) => value + 1);
  }, []);

  return (
    <AdminIntroPage routePath="contenu/legal">
      <div className="space-y-6">
        <LegalStatCards
          className="mb-2"
          refreshKey={statsKey}
          listFilter={listFilter}
          onListFilterChange={handleListFilterChange}
        />
        <div ref={listRef}>
          <LegalPagesList
            listFilter={listFilter}
            onListFilterChange={handleListFilterChange}
            onChanged={handleChanged}
          />
        </div>
      </div>
    </AdminIntroPage>
  );
}
