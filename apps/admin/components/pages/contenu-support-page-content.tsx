'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useAdminTabFromUrl } from '../../lib/use-admin-tab-from-url';
import { AdminListPageHeader } from './admin-list-page-header';
import { ContenuMessagesTabPanel } from './contenu-messages-tab-panel';
import { ContenuTicketsTabPanel } from './contenu-tickets-tab-panel';

const SUPPORT_TABS = ['tickets', 'messages'] as const;

export function ContenuSupportPageContent() {
  const t = useTranslations('pages.contenu.support');
  const { activeTab, setActiveTab } = useAdminTabFromUrl(SUPPORT_TABS, 'tickets');

  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="contenu/support" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList aria-label={t('tabsAria')}>
          <TabsTrigger value="tickets">{t('tabs.tickets')}</TabsTrigger>
          <TabsTrigger value="messages">{t('tabs.messages')}</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <ContenuTicketsTabPanel />
        </TabsContent>

        <TabsContent value="messages">
          <ContenuMessagesTabPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
