'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import type { SupportListFilter } from '../../config/support-kpi';
import { useAdminTabFromUrl } from '../../lib/use-admin-tab-from-url';
import { SupportStatCards } from '../support/support-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';
import { ContenuMessagesTabPanel } from './contenu-messages-tab-panel';
import { ContenuTicketsTabPanel } from './contenu-tickets-tab-panel';

const SUPPORT_TABS = ['tickets', 'messages'] as const;

export function ContenuSupportPageContent() {
  const t = useTranslations('pages.contenu.support');
  const { activeTab, setActiveTab } = useAdminTabFromUrl(SUPPORT_TABS, 'tickets');
  const [listFilter, setListFilter] = useState<SupportListFilter>({});
  const listRef = useRef<HTMLDivElement>(null);

  const handleListFilterChange = useCallback(
    (filter: SupportListFilter) => {
      setListFilter(filter);
      if (activeTab !== 'tickets') {
        setActiveTab('tickets');
      }
      listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    [activeTab, setActiveTab],
  );

  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="contenu/support" />
      <SupportStatCards
        className="mb-6"
        listFilter={listFilter}
        onListFilterChange={handleListFilterChange}
      />
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="space-y-6"
      >
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="tickets">{t('tabs.tickets')}</TabsTrigger>
          <TabsTrigger value="messages">{t('tabs.messages')}</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div ref={listRef}>
            <ContenuTicketsTabPanel
              listFilter={listFilter}
              onListFilterChange={handleListFilterChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <ContenuMessagesTabPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
