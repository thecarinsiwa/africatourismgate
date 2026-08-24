'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useAdminTabFromUrl } from '../../lib/use-admin-tab-from-url';
import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutPagesTabPanel } from './contenu-about-pages-tab-panel';
import { ContenuAboutResourcesTabPanel } from './contenu-about-resources-tab-panel';
import { ContenuAboutTeamTabPanel } from './contenu-about-team-tab-panel';
import { ContenuAboutTimelineTabPanel } from './contenu-about-timeline-tab-panel';
import { ContenuHappyCustomersTabPanel } from './contenu-happy-customers-tab-panel';
import { ContenuHeroTabPanel } from './contenu-hero-tab-panel';
import { ContenuWhyUsTabPanel } from './contenu-why-us-tab-panel';

const SITE_TABS = [
  'about-pages',
  'about-team',
  'about-timeline',
  'about-resources',
  'why-us',
  'hero',
  'happy-customers',
] as const;

export function ContenuSitePageContent() {
  const t = useTranslations('pages.contenu.site');
  const { activeTab, setActiveTab } = useAdminTabFromUrl(SITE_TABS, 'about-pages');

  return (
    <AdminIntroPage routePath="contenu/site">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList aria-label={t('tabsAria')} className="h-auto flex-wrap">
          <TabsTrigger value="about-pages">{t('tabs.aboutPages')}</TabsTrigger>
          <TabsTrigger value="about-team">{t('tabs.aboutTeam')}</TabsTrigger>
          <TabsTrigger value="about-timeline">{t('tabs.aboutTimeline')}</TabsTrigger>
          <TabsTrigger value="about-resources">{t('tabs.aboutResources')}</TabsTrigger>
          <TabsTrigger value="why-us">{t('tabs.whyUs')}</TabsTrigger>
          <TabsTrigger value="hero">{t('tabs.hero')}</TabsTrigger>
          <TabsTrigger value="happy-customers">{t('tabs.happyCustomers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="about-pages">
          <ContenuAboutPagesTabPanel />
        </TabsContent>

        <TabsContent value="about-team">
          <ContenuAboutTeamTabPanel />
        </TabsContent>

        <TabsContent value="about-timeline">
          <ContenuAboutTimelineTabPanel />
        </TabsContent>

        <TabsContent value="about-resources">
          <ContenuAboutResourcesTabPanel />
        </TabsContent>

        <TabsContent value="why-us">
          <ContenuWhyUsTabPanel />
        </TabsContent>

        <TabsContent value="hero">
          <ContenuHeroTabPanel />
        </TabsContent>

        <TabsContent value="happy-customers">
          <ContenuHappyCustomersTabPanel />
        </TabsContent>
      </Tabs>
    </AdminIntroPage>
  );
}
